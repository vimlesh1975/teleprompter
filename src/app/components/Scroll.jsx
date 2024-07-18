'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
const scrollingTextStyle = {
    position: 'absolute',
    top: '150px',
    width: '100%',
    textAlign: 'left',
    fontWeight: 'bolder',
    padding: '0 25px',
    boxSizing: 'border-box',
    fontSize: '40px'
};


const Scroll = ({ startPosition, allContent, showClock, speed, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, selectedRunOrderTitle, slugs, newsReaderText }) => {

    const containerRef = useRef(null);
    const textRef = useRef(null);
    const contentRefs = useRef([]);

    useEffect(() => {
        updateCurrentStory(currentStoryNumber, selectedRunOrderTitle)
    }, [currentStoryNumber])
    const updateCurrentStory = useCallback((curstory, curbulletin) => {
        // Your API call here
        fetch('/api/currentStory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curstory, curbulletin }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    useEffect(() => {
        let animationFrameId;

        const scrollText = async () => {
            if (textRef.current) {
                const currentTop = textRef.current.offsetTop;
                const newTop = currentTop - (speed / 60); // Assuming 60 frames per second
                textRef.current.style.top = `${newTop}px`;

                // Determine which div is at startPosition
                const startPositionDivIndex = contentRefs.current.findIndex((ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        return rect.top <= startPosition - 20 && rect.bottom > startPosition - 20;
                    }
                    return 0
                });

                if (startPositionDivIndex !== -1) {
                    if (startPositionDivIndex % 3 === 0) {
                        if (!loggedPositions.has(startPositionDivIndex)) {
                            const curstory = (startPositionDivIndex / 3) + 1;
                            setCurrentStoryNumber(curstory);
                            setLoggedPositions((prev) => new Set(prev).add(startPositionDivIndex));
                        }
                    }
                }

            }
            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
    }, [speed]);

    return (<div>
        <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 500, minHeight: 500, border: '1px solid black' }}>
            <div style={{ backgroundColor: 'white', color: 'red', fontSize: 18, fontWeight: 'bolder' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs.length})`}</div>
                    <div>{newsReaderText}</div>
                    <div>{showClock ? '' : '.'}</div>
                    <div style={{ display: showClock ? 'inline' : 'none' }}><Clock /></div>
                </div>
            </div>
            <div ref={containerRef} style={scrollContainerStyle}>
                <div ref={textRef} style={scrollingTextStyle}>
                    {allContent.map((line, i) => (
                        <div key={i} ref={(el) => (contentRefs.current[i] = el)} style={{ backgroundColor: i % 3 === 0 ? 'blue' : 'transparent' }}>
                            {line}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position: 'absolute', top: startPosition, scale: 1 }}>
                <Triangles />
            </div>
        </div>

    </div>)
}

export default Scroll
