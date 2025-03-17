'use client';

import { useState, useEffect, useRef } from "react";
import ScrollViewforcasparcg2 from '../components/ScrollViewforcasparcg2';
const scrollWidth = 782;
const scrollHeight = 440;


const Page = () => {
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);

  const container = useRef(null);

  const handleRightClick = (event) => {
    event.preventDefault(); // Prevent the default context menu from appearing
    console.log('Right-click detected, flipping content');

    const screenWidth = screen.width;

    const knownOrigins = {
      // 1920: 555,
      1920: 600,
      1680: 530,
      1600: 523,
      1440: 505,
      1366: 495,
      1360: 495,
      1280: 483,
      1176: 466,
      1152: 462,
      1024: 440,
      800: 392,
    };

    // Calculate transform origin using the linear formula if not in known origins
    const transformOriginX = knownOrigins[screenWidth] || (0.0893 * screenWidth + 284);

    // Toggle flip transformation
    if (container.current.style.transform.includes('rotateY(180deg)')) {
      // container.current.style.transformOrigin = '5px 0';
      container.current.style.transform = container.current.style.transform.replace('rotateY(180deg)', 'rotateY(0deg)');
    } else {
      // container.current.style.transformOrigin = `${transformOriginX}px 0%`;
      container.current.style.transform = container.current.style.transform + ' rotateY(180deg)';
    }
  };


  const toggleScaleAndMaximize = () => {
    if (!isMaximized) {
      // Maximize window (only works for popups)
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
      const screenHeight = screen.height;

      const knownOrigins = {
        1080: 160,
        1050: 165,
        1024: 160,
        960: 153,
        900: 155,
        864: 155,
        800: 150,
        768: 150,
        720: 140,
        664: 145,
        600: 135,
      };
      const sf = (screenHeight - (knownOrigins[screenHeight] || 150)) / scrollHeight;

      // Use `document.documentElement.clientHeight` for better height detection
      setScaleX(window.innerWidth / scrollWidth);
      setScaleY(sf);

    } else {
      // Restore window to a smaller size
      window.resizeTo(scrollWidth, scrollHeight);
      setScaleX(1);
      setScaleY(1);
    }

    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const handleResize = () => {
      if (isMaximized) {
        setScaleX(window.innerWidth / scrollWidth);
        setScaleY(document.documentElement.clientHeight / scrollHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMaximized]);

  return (
    <div
      onDoubleClick={toggleScaleAndMaximize} 
      onContextMenu={handleRightClick}
      ref={container}
    >
      <div
        style={{
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
          width: scrollWidth, // Ensures proper scaling
          height: scrollHeight, // Ensures proper scaling
        }}
      >
        {/* <p>ScaleX: {scaleX.toFixed(2)}</p>
        <p>ScaleY: {scaleY.toFixed(2)}</p> */}
        <ScrollViewforcasparcg2 />
      </div>
    </div>
  );
};

export default Page;
