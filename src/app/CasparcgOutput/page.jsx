'use client'
import React, { useState, useEffect, useRef } from 'react';
import Scroll from '../components/Scroll';

// const scrollWidth = 600;
const scrollHeight = 440;
const scrollWidth = 782;//scrollHeight * 16 / 9=782.22;

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

    function replaceCRLFInArray(inputArray) {
        // Ensure inputArray is an array of strings
        if (!Array.isArray(inputArray)) {
          throw new Error('Input is not an array');
        }
      
        // Map over the array and replace CRLF characters in each string
        return inputArray.map((inputString) => {
          // Ensure each element is a string
          if (typeof inputString !== 'string') {
            throw new Error('Array element is not a string');
          }
      
          // Replace all occurrences of \r, \n, or \r\n with an empty string
          return inputString.replaceAll('CRLF', "\r\n").replaceAll('closesmallbracket', ")");
        });
      }

    const setAllContent1 = (arrstr) => {
        setAllContent(replaceCRLFInArray(arrstr))
    }

    const setLoggedPositions1 = () => {
      setLoggedPositions(new Set());
  }

    useEffect(() => {
        window.setStartPosition = setStartPosition;
        window.setAllContent1 = setAllContent1;
        window.setSpeed = setSpeed;
        window.setFontSize = setFontSize;
        window.setShowClock = setShowClock;
        window.setNewsReaderText = setNewsReaderText;
        window.setDoubleClickedPosition = setDoubleClickedPosition;
        window.setSlugs = setSlugs;
        window.setCurrentSlug = setCurrentSlug;
        window.setSelectedRunOrderTitle = setSelectedRunOrderTitle;
        window.setNewPosition = setNewPosition;
        window.setCurrentStoryNumber = setCurrentStoryNumber;
        window.setLoggedPositions1 = setLoggedPositions1;

        return () => {
            delete window.setStartPosition;
            delete window.setAllContent1;
            delete window.setSpeed;
            delete window.setFontSize;
            delete window.setShowClock;
            delete window.setNewsReaderText;
            delete window.setDoubleClickedPosition;
            delete window.setSlugs;
            delete window.setCurrentSlug;
            delete window.setSelectedRunOrderTitle;
            delete window.setNewPosition;
            delete window.setCurrentStoryNumber;
            delete window.setLoggedPositions1;

        };
    }, []);

    return (
        <div >
            <Scroll scrollWidth={scrollWidth} scrollHeight={scrollHeight} fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
        </div>
    );
};

export default Page;
