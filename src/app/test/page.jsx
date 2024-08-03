'use client'
import React, { useState, useEffect,useRef } from 'react';
import Scroll from '../components/Scroll';

const Page = () => {
  const [startPosition, setStartPosition] = useState(150);
  const [speed, setSpeed] = useState(0);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');
  const [slugs, setSlugs] = useState([]);
  const [currentSlug, setCurrentSlug] = useState(0);
  const [allContent, setAllContent] = useState([]);
  const [newsReaderText, setNewsReaderText] = useState('Continue...');
  const [showClock, setShowClock] = useState(true);
  const [newPosition, setNewPosition] = useState(startPosition);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const [fontSize, setFontSize] = useState(39);

  const textRef = useRef(null);
    useEffect(() => {
        window.setStartPosition = setStartPosition;
        window.setAllContent = setAllContent;
        window.setSpeed = setSpeed;
        window.setFontSize = setFontSize;
        window.setShowClock = setShowClock;
        window.setNewsReaderText = setNewsReaderText;
        window.setDoubleClickedPosition = setDoubleClickedPosition;
        window.setSlugs = setSlugs;
        window.setCurrentSlug = setCurrentSlug;
        window.setSelectedRunOrderTitle = setSelectedRunOrderTitle;
        

        return () => {
            delete window.setStartPosition;
            delete window.setAllContent;
            delete window.setSpeed;
            delete window.setFontSize;
            delete window.setShowClock;
            delete window.setNewsReaderText;
            delete window.setDoubleClickedPosition;
            delete window.setSlugs;
            delete window.setCurrentSlug;
            delete window.setSelectedRunOrderTitle;

        };
    }, []);

    return (
        <div >
            <Scroll fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
        </div>
    );
};

export default Page;
