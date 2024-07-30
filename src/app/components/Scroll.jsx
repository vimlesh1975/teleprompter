'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
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
        top: newPosition,
        width: '100%',
        textAlign: 'left',
        fontWeight: 'bolder',
        padding: '0 25px',
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize)
    };

    const containerRef = useRef(null);
    const contentRefs = useRef([]);

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
                setNewPosition(prevTop => prevTop - (speed / 9.2));

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
            }
            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }, [speed, doubleClickedPosition, startPosition, loggedPositions, setLoggedPositions, setCurrentStoryNumber, textRef]);

    return (
        <div>
            <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 522, minHeight: 522, border: '1px solid black' }}>
                <div style={{ backgroundColor: 'white', color: 'red', fontSize: 18, fontWeight: 'bolder' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs?.length})`}</div>
                        <div>{newsReaderText}</div>
                        <div>{showClock ? '' : '.'}</div>
                        <div style={{ display: showClock ? 'inline' : 'none' }}><Clock /></div>
                    </div>
                </div>
                <div ref={containerRef} style={scrollContainerStyle}>
                    <div ref={textRef} style={scrollingTextStyle}>
                        {allContent.map((line, i) => (
                            <div key={i} ref={(el) => (contentRefs.current[i] = el)} style={{ backgroundColor: i % 3 === 0 ? 'blue' : 'transparent', color: i % 3 === 0 ? 'yellow' : 'white' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', top: parseInt(startPosition)-20}}>
                        <Triangles />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Scroll;
