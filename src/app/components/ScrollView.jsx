import React from 'react'
import Count from './Count';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';

const Clock = dynamic(() => import('./Clock'), { ssr: false });



//ff
const ScrollView = ({ currentFont, fontBold, isRTL, bgColor, fontColor, allContent, newPosition, fontSize, currentStoryNumber, crossedLines, storyLines, scrollWidth, slugs, newsReaderText, showClock, startPosition }) => {


    const scrollContainerStyle = {
        position: 'relative',
        height: '440px',
        overflow: 'hidden',
        // backgroundColor: '#ff0000',
        backgroundColor: bgColor,
        color: '#fff',
    };

    const scrollingTextStyle = {
        position: 'absolute',
        // top: parseFloat(newPosition),
        transform: `translateY(${newPosition}px)`,
        willChange: 'transform',

        minWidth: 702,
        maxWidth: 702,
        // textAlign: 'left',
        // fontWeight: 'bolder',
        padding: '0 40px',
        // boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize),
        // lineHeight: `${fontSize * 1.5}px` 
        lineHeight: `${Math.floor(fontSize * 1.5)}px` // Removes decimal part
    };


    return (<div>

        <div style={{ maxWidth: scrollWidth, minWidth: scrollWidth, backgroundColor: 'lightgray', color: 'blue', fontSize: 18, fontWeight: 'bolder' }}>
            <div style={{ backgroundColor: 'lightgreen', width: `${Math.min((crossedLines / storyLines[currentStoryNumber - 1]) * 100, 100)}%` }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', width: scrollWidth }}>
                    <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs?.length})`}</div>
                    <div>{newsReaderText}</div>
                    <div><Count currentStoryNumber={currentStoryNumber} /></div>
                    <div>ScrollView</div>
                    <div>{showClock ? '' : '.'}</div>
                    <div style={{ display: showClock ? 'inline' : 'none', color: 'red' }}><Clock /></div>
                    <div >{crossedLines}/{storyLines[currentStoryNumber - 1]}</div>
                </div>
            </div>
        </div>

        <div style={scrollContainerStyle}>
            <div style={scrollingTextStyle}>
                {allContent.map((content, i) => (
                    <div dir={(i % 3 === 1) ? (isRTL ? 'rtl' : 'ltr') : 'ltr'} key={i} style={{ fontFamily: (i % 3 === 1) ? currentFont : '', backgroundColor: i % 3 === 0 ? 'blue' : 'transparent', color: i % 3 === 0 ? 'yellow' : fontColor, fontWeight: (i % 3 === 1) ? (fontBold ? 'bold' : 'normal') : 'normal' }}>
                        {content}
                    </div>
                ))}
            </div>
            <div style={{ position: 'absolute', top: parseInt(startPosition) - 20 }}>
                <Triangles />
            </div>
        </div>
    </div>

    )
}

export default ScrollView