'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';

const Clock = dynamic(() => import('./Clock'), { ssr: false });

const scrollContainerStyle = {
    position: 'relative',
    height: '500px',
    overflow: 'hidden',
    backgroundColor: '#000',
    color: '#fff'
};

const Scroll = ({ fontSize, setCurrentSlug, newPosition, setNewPosition, doubleClickedPosition, textRef, startPosition, allContent, showClock, speed, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, selectedRunOrderTitle, slugs, newsReaderText }) => {
    const scrollingTextStyle = {
        position: 'absolute',
        top: parseFloat(newPosition),
        width: '100%',
        textAlign: 'left',
        fontWeight: 'bolder',
        padding: '0 25px',
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize),
        lineHeight: `${fontSize * 1.3}px` // Adjust line height as needed
    };

    const containerRef = useRef(null);
    const contentRefs = useRef([]);
    const [storyLines, setStoryLines] = useState([]);
    const [crossedLines, setCrossedLines] = useState(0);

    const updateCurrentStory = useCallback((curstory, curbulletin) => {
        fetch('/api/currentStory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curstory, curbulletin }),
        })
            .then(response => response.json())
            .then(data => {
                // console.log('Success:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    useEffect(() => {
        updateCurrentStory(currentStoryNumber, selectedRunOrderTitle);
    }, [currentStoryNumber, selectedRunOrderTitle, updateCurrentStory]);

    useEffect(() => {
        let animationFrameId;

        const scrollText = async () => {
            if (textRef.current) {
                // setNewPosition(prevTop => prevTop - (speed / 9.2));
                setNewPosition(prevTop => prevTop - (speed / 2.2));

                // Determine which div is at startPosition
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
                    const ref = contentRefs.current[(currentStoryNumber - 1)*3];
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        const style = getComputedStyle(ref);
                        const lineHeight = parseFloat(style.lineHeight);
                        if (rect.top < startPosition) {
                            linesCrossed = Math.floor((startPosition - rect.top) / lineHeight);
                            if (linesCrossed>storyLines[currentStoryNumber-1]){
                                linesCrossed=storyLines[currentStoryNumber-1];
                            }
                        }
                    }
                    setCrossedLines(linesCrossed);
                // }
               
            }
            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }, [setCrossedLines,speed, doubleClickedPosition, startPosition, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, textRef]);


    // Function to calculate number of lines in a given element
    const calculateNumberOfLines = (element) => {
        if (element) {
            const style = getComputedStyle(element);
            const lineHeight = parseFloat(style.lineHeight);
            const height = element.clientHeight;
            return Math.floor(height / lineHeight);
        }
        return 0;
    };

    // Group elements into stories and calculate lines
    useEffect(() => {
        const storiesLines = [];

        for (let i = 0; i < contentRefs.current.length; i += 3) {
            const storyLines = [
                calculateNumberOfLines(contentRefs.current[i]),
                calculateNumberOfLines(contentRefs.current[i + 1]),
                calculateNumberOfLines(contentRefs.current[i + 2]),
            ].reduce((acc, lines) => acc + lines, 0);

            storiesLines.push(storyLines);
        }


        storiesLines.forEach((lines, index) => {
            console.log(`Story ${index + 1} has ${lines} lines.`);
        });
        setStoryLines(storiesLines)
    }, [allContent, fontSize]);

    // Calculate width based on lines crossed
    const maxLines = storyLines[currentStoryNumber - 1];
    const widthPercentage = Math.min((crossedLines / maxLines) * 100, 100);

    return (
        <div>
            <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 522, minHeight: 522, border: '1px solid black' }}>
                <div style={{ backgroundColor: 'white', color: 'blue', fontSize: 18, fontWeight: 'bolder' }}>
                    <div style={{ backgroundColor: 'lightgreen', width: `${widthPercentage}%` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: 600 }}>
                            <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs?.length})`}</div>
                            <div>{newsReaderText}</div>
                            <div>{showClock ? '' : '.'}</div>
                            <div style={{ display: showClock ? 'inline' : 'none' }}><Clock /></div>
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
