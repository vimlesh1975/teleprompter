'use client'
import React, { useState, useEffect } from 'react';
import ScrollViewforcasparcg from '../components/ScrollViewforcasparcg';

const scrollWidth = 782;//scrollHeight * 16 / 9=782.22;

const Page = () => {
  const [startPosition, setStartPosition] = useState(150);
  const [newsReaderText, setNewsReaderText] = useState('Continue...');
  const [showClock, setShowClock] = useState(true);
  const [fontSize, setFontSize] = useState(39);

  useEffect(() => {
    window.setStartPosition = setStartPosition;
    window.setFontSize = setFontSize;
    window.setShowClock = setShowClock;
    window.setNewsReaderText = setNewsReaderText;

    return () => {
      delete window.setStartPosition;
      delete window.setFontSize;
      delete window.setShowClock;
      delete window.setNewsReaderText;
    };
  }, []);

  return (
    <div >
      <ScrollViewforcasparcg  fontSize={fontSize} scrollWidth={scrollWidth} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
    </div>
  );
};

export default Page;
