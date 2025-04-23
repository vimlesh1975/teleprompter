'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';
import io from 'socket.io-client';
import Count from './Count';
import { changeStoryLines, changeCrossedLines } from '../store/store'; // Adjust the path as needed

import { useDispatch, useSelector } from 'react-redux';


function moveZerosToFront(arr) {
    return [...arr.filter(n => n === 0), ...arr.filter(n => n !== 0)];
}

const Clock = dynamic(() => import('./Clock'), { ssr: false });

const scrollContainerStyle = {
    position: 'relative',
    height: '440px',
    overflow: 'hidden',
    backgroundColor: '#000',
    color: '#fff'
};

const Scroll = ({ scaleFactor = 1, scrollWidth, scrollHeight, fontSize, setCurrentSlug, newPosition, setNewPosition, doubleClickedPosition, textRef, startPosition, allContent, showClock, speed, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, slugs, newsReaderText, setSpeed }) => {
    const dispatch = useDispatch();
    const storyLines = useSelector((state) => state.storyLinesReducer.storyLines);
    const crossedLines = useSelector((state) => state.crossedLinesReducer.crossedLines);

    const containerRef = useRef(null);
    const contentRefs = useRef([]);

    const scrollingTextStyle = useMemo(() => ({
        position: 'absolute',
        // top: parseFloat(newPosition),
        // transform: `translateY(${newPosition}px)`,
        transform: `translateY(${newPosition.toFixed(2)}px)`,
        willChange: 'transform',

        minWidth: 702,
        maxWidth: 702,
        textAlign: 'left',
        padding: '0 40px',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize),
        lineHeight: `${Math.floor(fontSize * 1.5)}px`
    }), [newPosition, fontSize]);


    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            console.log('SOCKET CONNECTED! from Scroll page', socketRef.current.id);
        });

        return () => {
            socketRef.current.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.emit('setCurrentStoryNumber', currentStoryNumber);
        return () => {
            socketRef.current?.off('setCurrentStoryNumber');
        };

    }, [currentStoryNumber])

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit('crossedLines', crossedLines);
            return () => {
                socketRef.current?.off('crossedLines');
            };
        }
    }, [crossedLines])

    useEffect(() => {
        if (!socketRef.current) return;
        socketRef.current.emit('storyLines', storyLines);
        return () => {
            socketRef.current?.off('storyLines');
        };

    }, [storyLines])

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.emit('newPosition', newPosition);

        return () => {
            socketRef.current?.off('newPosition');
        };
    }, [newPosition]);

    useEffect(() => {
        let animationFrameId;

        const scrollText = async () => {
            if (textRef.current) {
                const { top, height } = textRef.current.getBoundingClientRect();
                if (top < -height) {
                    setSpeed(0); // Stop the movement
                    return;
                }
                setNewPosition(prevTop => prevTop - (speed / 2.2));

                const startPositionDivIndex = contentRefs.current.findIndex((ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        return rect.top <= startPosition && rect.bottom > startPosition;
                    }
                    return 0;
                });

                if (startPositionDivIndex !== -1) {
                    if (startPositionDivIndex % 3 === 0) {
                        if (!loggedPositions.has(startPositionDivIndex)) {
                            const curstory = ((startPositionDivIndex) / 3) + 1 + doubleClickedPosition;
                            setCurrentStoryNumber(curstory);
                            setCurrentSlug(curstory - 1);
                            setLoggedPositions((prev) => new Set(prev).add(startPositionDivIndex));
                        }
                    }
                }
                // Track lines that have crossed the startPosition
                // if(speed!==0){
                let linesCrossed = 0;
                const ref = contentRefs.current[(-doubleClickedPosition + currentStoryNumber - 1) * 3];
                if (ref) {
                    // console.log(scaleFactor)
                    const rect = ref.getBoundingClientRect();
                    // console.log(rect)

                    const style = getComputedStyle(ref);
                    var lineHeight = (parseFloat(style.lineHeight)) * scaleFactor;

                    if (rect.top < startPosition) {
                        if (scaleFactor > 1) {
                            linesCrossed = 1 + Math.floor((startPosition - rect.top) / lineHeight);
                        }
                        else {
                            linesCrossed = 1 + Math.floor((startPosition - rect.top) / lineHeight);
                        }
                        if (linesCrossed > storyLines[currentStoryNumber - 1]) {
                            linesCrossed = storyLines[currentStoryNumber - 1];
                        }
                    }
                }
                // dispatch(changeCrossedLines(linesCrossed));
                if (linesCrossed !== crossedLines) {
                    dispatch(changeCrossedLines(linesCrossed));
                }
            }
            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }, [scaleFactor, speed, doubleClickedPosition, startPosition, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, textRef,  setNewPosition]);

    // Function to calculate number of lines in a given element
    const calculateNumberOfLines = (element) => {
        if (element) {
            const style = getComputedStyle(element);
            const lineHeight = parseFloat(style.lineHeight);
            const height = element.clientHeight;
            return height / lineHeight; // Return the float value directly
        }
        return 0;
    };

    // Group elements into stories and calculate lines
    useEffect(() => {
        const storiesLines = [];

        for (let i = 0; i < slugs.length * 3; i += 3) {
            // Sum up line counts for three elements first
            const totalLines =
                calculateNumberOfLines(contentRefs.current[i]) +
                calculateNumberOfLines(contentRefs.current[i + 1]) +
                calculateNumberOfLines(contentRefs.current[i + 2]);

            // Apply Math.floor to the total
            var flooredLines = 0;
            if (totalLines > 0) {
                flooredLines = 1 + Math.floor(totalLines);
            }
            storiesLines.push(flooredLines);
        }

        const result = moveZerosToFront(storiesLines);
        dispatch(changeStoryLines(result));
        socketRef.current.emit('storyLines', result);
    }, [allContent, fontSize]);
    // Calculate width based on lines crossed
    const maxLines = storyLines[currentStoryNumber - 1] || 1;
    const widthPercentage = Math.min((crossedLines / maxLines) * 100, 100);

    return (
        <div>
            <div style={{ maxWidth: scrollWidth, minWidth: scrollWidth, maxHeight: scrollHeight, minHeight: scrollHeight, border: '1px solid black' }}>
                <div style={{ backgroundColor: 'lightgray', color: 'blue', fontSize: 18, fontWeight: 'bolder' }}>
                    <div style={{ backgroundColor: 'lightgreen', width: `${widthPercentage}%` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: scrollWidth }}>
                            <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs?.length})`}</div>
                            <div>{newsReaderText}</div>
                            <div><Count currentStoryNumber={currentStoryNumber} /></div>
                            <div>{showClock ? '' : '.'}</div>
                            <div style={{ display: showClock ? 'inline' : 'none', color: 'red' }}><Clock /></div>
                            <div >{crossedLines}/{storyLines[currentStoryNumber - 1]}</div>
                        </div>
                    </div>
                </div>
                <div ref={containerRef} style={scrollContainerStyle}>
                    <div ref={textRef} style={scrollingTextStyle}>
                        {allContent.map((content, i) => (
                            <div key={i} ref={(el) => (contentRefs.current[i] = el)} style={{ backgroundColor: i % 3 === 0 ? 'blue' : 'transparent', color: i % 3 === 0 ? 'yellow' : 'white' }}>
                                {content}
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', top: parseInt(startPosition) - 20 }}>
                        <Triangles />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Scroll;
