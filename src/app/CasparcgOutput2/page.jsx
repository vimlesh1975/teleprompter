'use client';

import { useState, useEffect } from "react";
import ScrollViewforcasparcg2 from '../components/ScrollViewforcasparcg2';

const Page = () => {
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleScaleAndMaximize = () => {
    if (!isMaximized) {
      // Maximize window (only works for popups)
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);

      // Scale content to fit screen width & height
      setScaleX(window.innerWidth / 782);
      setScaleY(window.innerHeight / 440);
    } else {
      // Restore window to a smaller size
      window.resizeTo(800, 600);
      setScaleX(1);
      setScaleY(1);
    }

    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const handleResize = () => {
      if (isMaximized) {
        setScaleX(window.innerWidth / 782);
        setScaleY(window.innerHeight / 440);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMaximized]);

  return (
    <div onDoubleClick={toggleScaleAndMaximize} style={{ overflow: "hidden" }}>
      <div
        style={{
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
        }}
      >{scaleX}
      {scaleY}
        <ScrollViewforcasparcg2 />
      </div>
    </div>
  );
};

export default Page;
