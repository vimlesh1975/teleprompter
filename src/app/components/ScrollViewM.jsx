'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';

const Clock = dynamic(() => import('./Clock'), { ssr: false });

const ScrollViewM = ({
    scrollContainerStyle, scrollingTextStyle, currentFont, fontBold,
    isRTL, fontColor, allContent, currentStoryNumber, crossedLines,
    storyLines, slugs, newsReaderText, showClock, startPosition,
    contentRefs, textRef, speed,
}) => {
    return (
        <div>
            <div style={{
                backgroundColor: 'lightgray',
                color: 'blue',
                fontSize: 18 * 2.5,
                fontWeight: 'bolder',
                width: 1920,
                height: 60, // ✅ Add fixed height
            }}>
                <div style={{
                    backgroundColor: 'lightgreen',
                    width: `${Math.min((crossedLines / storyLines[currentStoryNumber - 1]) * 100, 100)}%`,
                    height: 60, // ✅ Add fixed height

                }}>
                    <div style={{ display: 'flex', position: 'relative', width: 1920 }}>
                        <div style={{ position: 'absolute', left: 10, }}>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs?.length})`}</div>
                        <div style={{ position: 'absolute', left: 300, }}>{newsReaderText}</div>

                        <div style={{ position: 'absolute', left: 600, }}>{'Speed:' + speed}</div>


                        <div style={{ position: 'absolute', left: 1500, visibility: showClock ? 'visible' : 'hidden', color: 'red' }}> <Clock /></div>
                        <div style={{ position: 'absolute', left: 1750, }}>{crossedLines}/{storyLines[currentStoryNumber - 1]}</div>
                    </div>
                </div>
            </div>
            {
                <div style={scrollContainerStyle}>
                    <div ref={textRef} style={scrollingTextStyle}>
                        {allContent.map((content, i) => (
                            <div
                                key={i}
                                dir={(i % 3 === 1) ? (isRTL ? 'rtl' : 'ltr') : 'ltr'}
                                ref={(el) => (contentRefs.current[i] = el)}
                                style={{
                                    fontFamily: (i % 3 === 1) ? currentFont : 'Times New Roman',
                                    backgroundColor: i % 3 === 0 ? 'blue' : 'transparent',
                                    color: i % 3 === 0 ? 'yellow' : fontColor,
                                    fontWeight: (i % 3 === 1) ? (fontBold ? 'bold' : 'normal') : 'normal'
                                }}
                            >
                                {content}
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', top: parseInt(startPosition) - 50 }}>
                        <Triangles />
                    </div>
                </div>}

        </div>
    );
};

export default ScrollViewM;
