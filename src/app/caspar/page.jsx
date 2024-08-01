'use client'
import React from 'react'
import Scroll from '../components/Scroll'

export default function Home({ fontSize, setCurrentSlug, newPosition, setNewPosition, doubleClickedPosition, textRef, startPosition, allContent, showClock, speed, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, selectedRunOrderTitle, slugs, newsReaderText }) {
    return (
        <div style={{ backgroundColor: 'yellow' }}>
            <h1>Hello Vimlesh</h1>
            <Scroll  fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition}  allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
        </div>
    )
}

