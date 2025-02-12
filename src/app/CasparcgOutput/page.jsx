'use client'
import React, { useState, useEffect, useRef } from 'react';
import ScrollViewforcasparcg from '../components/ScrollViewforcasparcg';

const scrollWidth = 782;//scrollHeight * 16 / 9=782.22;

const Page = () => {
  const [startPosition, setStartPosition] = useState(150);
  const [slugs, setSlugs] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [newsReaderText, setNewsReaderText] = useState('Continue...');
  const [showClock, setShowClock] = useState(true);
  const [fontSize, setFontSize] = useState(39);

  function replaceCRLFInArray(inputArray) {
    if (!Array.isArray(inputArray)) {
      throw new Error('Input is not an array');
    }

    return inputArray.map((inputString) => {
      if (typeof inputString !== 'string') {
        throw new Error('Array element is not a string');
      }
      return inputString.replaceAll('CRLF', "\r\n").replaceAll('closesmallbracket', ")").replaceAll('space1', " ");
    });
  }

  const setAllContent1 = (arrstr) => {
    setAllContent(replaceCRLFInArray(arrstr))
  }

  useEffect(() => {
    window.setStartPosition = setStartPosition;
    window.setAllContent1 = setAllContent1;
    window.setFontSize = setFontSize;
    window.setShowClock = setShowClock;
    window.setNewsReaderText = setNewsReaderText;
    window.setSlugs = setSlugs;

    return () => {
      delete window.setStartPosition;
      delete window.setAllContent1;
      delete window.setFontSize;
      delete window.setShowClock;
      delete window.setNewsReaderText;
      delete window.setSlugs;
    };
  }, []);

  return (
    <div >
      <ScrollViewforcasparcg allContent={allContent} fontSize={fontSize} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
    </div>
  );
};

export default Page;
