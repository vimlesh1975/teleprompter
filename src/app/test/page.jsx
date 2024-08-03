'use client'
import React, { useState, useEffect,useRef } from 'react';
import Scroll from '../components/Scroll';

const Page = () => {
    const [aa, setAa] = useState('aa');

    
  const [startPosition, setStartPosition] = useState(150);
  const [speed, setSpeed] = useState(1);
  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');
  const [slugs, setSlugs] = useState([]);
  const [scriptID, setScriptID] = useState('');
  const [currentSlug, setCurrentSlug] = useState(0);
  const [currentSlugName, setCurrentSlugName] = useState('');
  const [content, setContent] = useState('');
  const [allContent, setAllContent] = useState([]);
  const [newsReaderText, setNewsReaderText] = useState('Continue...');
  const [showClock, setShowClock] = useState(true);
  const [newPosition, setNewPosition] = useState(startPosition);
  const [tempSpeed, setTempSpeed] = useState(0);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
  const [showNewWindow, setShowNewWindow] = useState(false);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const [fontSize, setFontSize] = useState(39);

  
  const newWindowRef = useRef(null);




  const textRef = useRef(null);
    //   { fontSize, setCurrentSlug, newPosition, setNewPosition, doubleClickedPosition, textRef, startPosition, allContent, showClock, speed, loggedPositions, setLoggedPositions, currentStoryNumber, setCurrentStoryNumber, selectedRunOrderTitle, slugs, newsReaderText }

    // Define bb function and set it to window object in useEffect
    useEffect(() => {
       
        // Set the function to the global window object
        window.setStartPosition = setStartPosition;
        window.setAllContent = setAllContent;
        window.setSpeed = setSpeed;

        // Cleanup function to avoid memory leaks
        return () => {
            delete window.setStartPosition;
            delete window.setAllContent;
            delete window.setSpeed;
        };
    }, []);

    return (
        <div >
            <Scroll fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
        </div>
    );
};

export default Page;
