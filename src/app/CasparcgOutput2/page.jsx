'use client';

import { useState, useEffect, useRef } from "react";
import ScrollViewforcasparcg from '../components/ScrollViewforcasparcg';
const scrollWidth = 782;
const scrollHeight = 440;


const Page = () => {
  const [scaleX, setScaleX] = useState(0.41);
  const [scaleY, setScaleY] = useState(0.43);
  const [isMaximized, setIsMaximized] = useState(false);

  const container = useRef(null);

  const handleRightClick = (event) => {
    event.preventDefault(); // Prevent the default context menu from appearing
    console.log('Right-click detected, flipping content');

    const screenWidth = screen.width;

    const knownOrigins = {
      1920: 1350,
      1680: 1305,
      1600: 1260,
      1440: 1220,
      1366: 1200,
      1360: 1200,
      1280: 1170,
      1176: 1145,
      1152: 1120,
      1024: 1070,
      800: 950,
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
    console.log('double clicked')
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
      const sf = (screenHeight - (knownOrigins[screenHeight] || 150)) / 1080;

      // Use `document.documentElement.clientHeight` for better height detection
      setScaleX(window.innerWidth / 1920);
      setScaleY(sf);

    } else {
      // Restore window to a smaller size
      window.resizeTo(scrollWidth, scrollHeight + 130);
      setScaleX(0.41);
      setScaleY(0.43);
    }

    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const handleResize = () => {
      // if (isMaximized) {
      setScaleX(window.innerWidth / 1920);
      setScaleY(document.documentElement.clientHeight / 1080);
      // }
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
        <ScrollViewforcasparcg />
      </div>
    </div>
  );
};

export default Page;
