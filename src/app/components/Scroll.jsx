'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';
import io from 'socket.io-client';
import Count from './Count';
import { changeStoryLines, changeCrossedLines } from '../store/store';

import { useDispatch, useSelector } from 'react-redux';

function moveZerosToFront(arr) {
    return [...arr.filter(n => n === 0), ...arr.filter(n => n !== 0)];
}

const Clock = dynamic(() => import('./Clock'), { ssr: false });

const Scroll = ({
    currentFont, fontBold, isRTL, bgColor, fontColor,
    scaleFactor = 1, scrollWidth, scrollHeight, fontSize,
    setCurrentSlug, newPosition, setNewPosition,
    doubleClickedPosition, textRef, startPosition,
    allContent, showClock, speed, loggedPositions,
    setLoggedPositions, currentStoryNumber, setCurrentStoryNumber,
    slugs, newsReaderText, setSpeed
}) => {

    const dispatch = useDispatch();
    const storyLines = useSelector((state) => state.storyLinesReducer.storyLines);
    const crossedLines = useSelector((state) => state.crossedLinesReducer.crossedLines);

    const containerRef = useRef(null);
    const contentRefs = useRef([]);
    const socketRef = useRef(null);

    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleX = scrollWidth / baseWidth;
    const scaleY = scrollHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY); // keep aspect ratio

    const scrollContainerStyle = {
        position: 'relative',
        height: 1800,
        overflow: 'hidden',
        backgroundColor: bgColor,
        color: '#fff',
    };

    const scrollingTextStyle = useMemo(() => ({
        position: 'absolute',
        transform: `translateY(${newPosition}px)`,
        willChange: 'transform',
        width: 1720,
        padding: '0 100px',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize),
        lineHeight: `${Math.floor(fontSize * 1.5)}px`,
    }), [newPosition, fontSize]);


    // Socket connections
    useEffect(() => {
        socketRef.current = io();
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        socketRef.current?.emit('setCurrentStoryNumber', currentStoryNumber);
    }, [currentStoryNumber]);

    useEffect(() => {
        socketRef.current?.emit('crossedLines', crossedLines);
    }, [crossedLines]);

    useEffect(() => {
        socketRef.current?.emit('storyLines', storyLines);
    }, [storyLines]);

    useEffect(() => {
        socketRef.current?.emit('newPosition', newPosition);
    }, [newPosition]);

    useEffect(() => {
        let animationFrameId;

        const scrollText = () => {
            if (textRef.current) {
                const { top, height } = textRef.current.getBoundingClientRect();
                if (top < -height) {
                    setSpeed(0);
                    return;
                }

                setNewPosition(prev => parseFloat((prev - speed * 1.2).toFixed(2)));

                const startPositionDivIndex = contentRefs.current.findIndex((ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        return (rect.top / scale <= startPosition && rect.bottom / scale > startPosition);
                    }
                    return false;
                });

                if (startPositionDivIndex !== -1 && startPositionDivIndex % 3 === 0) {
                    if (!loggedPositions.has(startPositionDivIndex)) {
                        const curstory = ((startPositionDivIndex) / 3) + 1 + doubleClickedPosition;
                        setCurrentStoryNumber(curstory);
                        setCurrentSlug(curstory - 1);
                        setLoggedPositions((prev) => new Set(prev).add(startPositionDivIndex));
                    }
                }

                let linesCrossed = 0;
                const ref = contentRefs.current[(-doubleClickedPosition + currentStoryNumber - 1) * 3];
                if (ref) {
                    const rect = ref.getBoundingClientRect();
                    const style = getComputedStyle(ref);
                    const lineHeight = parseFloat(style.lineHeight);

                    const scaledTop = rect.top / scale;
                    // const scaledStartPos = startPosition / scale;

                    if (scaledTop < startPosition) {
                        linesCrossed = 1 + Math.floor((startPosition - scaledTop) / lineHeight);
                        if (linesCrossed > storyLines[currentStoryNumber - 1]) {
                            linesCrossed = storyLines[currentStoryNumber - 1];
                        }
                    }
                }
                // console.log(linesCrossed)
                if (linesCrossed !== crossedLines) {
                    dispatch(changeCrossedLines(linesCrossed));
                }
            }

            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId);
    }, [scaleFactor, speed, doubleClickedPosition, startPosition, loggedPositions, currentStoryNumber, storyLines]);

    // Count story lines
    const calculateNumberOfLines = (element) => {
        if (element) {
            const style = getComputedStyle(element);
            const lineHeight = parseFloat(style.lineHeight);
            const height = element.clientHeight;
            return height / lineHeight;
        }
        return 0;
    };

    useEffect(() => {
        const storiesLines = [];
        for (let i = 0; i < slugs.length * 3; i += 3) {
            const totalLines =
                calculateNumberOfLines(contentRefs.current[i]) +
                calculateNumberOfLines(contentRefs.current[i + 1]) +
                calculateNumberOfLines(contentRefs.current[i + 2]);

            const flooredLines = totalLines > 0 ? 1 + Math.floor(totalLines) : 0;
            storiesLines.push(flooredLines);
        }

        const result = moveZerosToFront(storiesLines);
        console.log(result)
        dispatch(changeStoryLines(result));
        socketRef.current.emit('storyLines', result);
    }, [allContent, fontSize]);

    const maxLines = storyLines[currentStoryNumber - 1] || 1;
    const widthPercentage = Math.min((crossedLines / maxLines) * 100, 100);

    return (
        <div style={{ width: scrollWidth, height: scrollHeight, overflow: 'hidden', border: '1px solid black' }}>
            <div style={{
                width: baseWidth,
                height: baseHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
            }}>
                <div style={{ backgroundColor: 'lightgray', color: 'blue', fontSize: 18 * 2.5, fontWeight: 'bolder' }}>
                    <div style={{ backgroundColor: 'lightgreen', width: `${widthPercentage}%` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: baseWidth }}>
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
                            <div
                                dir={(i % 3 === 1) ? (isRTL ? 'rtl' : 'ltr') : 'ltr'}
                                key={i}
                                ref={(el) => (contentRefs.current[i] = el)}
                                style={{
                                    fontFamily: (i % 3 === 1) ? currentFont : '',
                                    backgroundColor: i % 3 === 0 ? 'blue' : 'transparent',
                                    color: i % 3 === 0 ? 'yellow' : fontColor,
                                    fontWeight: (i % 3 === 1) ? (fontBold ? 'bold' : 'normal') : 'normal'
                                }}
                            >
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
