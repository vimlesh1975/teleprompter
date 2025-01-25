import React, { useEffect, useState } from 'react'
import Count from './Count';
import dynamic from 'next/dynamic';
import Triangles from './Triangles';
import io from 'socket.io-client';


const socket = io();
socket.on('connect', () => {
    console.log('SOCKET CONNECTED! from Scrollviewforcasparcg page', socket.id);
});

const Clock = dynamic(() => import('./Clock'), { ssr: false });

const scrollContainerStyle = {
    position: 'relative',
    height: '440px',
    overflow: 'hidden',
    backgroundColor: '#000',
    color: '#fff'
};

//ff
const ScrollViewforcasparcg = ({ allContent, fontSize, scrollWidth, slugs, newsReaderText, showClock, startPosition }) => {

    const [crossedLines, setCrossedLines] = useState(0);
    const [storyLines, setStoryLines] = useState([]);
    const [newPosition, setNewPosition] = useState(startPosition);
    const [currentStoryNumber, setCurrentStoryNumber] = useState(1);

    window.setNewPosition = setNewPosition;
    window.setStoryLines = setStoryLines;

    useEffect(() => {
        socket.on("crossedLines2", (data) => {
            setCrossedLines(data);
        });
        socket.on("storyLines2", (data) => {
            console.log(data)
            setStoryLines(data);
        });
        socket.on("newPosition2", (data) => {
            setNewPosition(data);
        });
        socket.on("setCurrentStoryNumber2", (data) => {
            setCurrentStoryNumber(data);
        })
        return () => {
            socket.off("crossedLines2");
            socket.off("storyLines2");
            socket.off("newPosition2");
            socket.off("setCurrentStoryNumber2");
        }

    }, [])


    const scrollingTextStyle = {
        position: 'absolute',
        top: parseFloat(newPosition),
        minWidth: 702,
        maxWidth: 702,
        textAlign: 'left',
        padding: '0 40px',
        whiteSpace: 'pre-wrap',
        fontSize: parseInt(fontSize),
        lineHeight: `${fontSize * 1.5}px`
    };


    return (<div>

        <div style={{ backgroundColor: 'lightgray', color: 'blue', fontSize: 18, fontWeight: 'bolder', width: scrollWidth }}>
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
                    <div key={i} style={{ backgroundColor: i % 3 === 0 ? 'blue' : 'transparent', color: i % 3 === 0 ? 'yellow' : 'white' }}>
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

export default ScrollViewforcasparcg