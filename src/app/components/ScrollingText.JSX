import React, { useEffect, useRef, useState } from 'react';
import './ScrollingText.css';

const ScrollingText = ({ text }) => {
  const [textHeight, setTextHeight] = useState(0);
  const [uniqueKey, setUniqueKey] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(10);
  const containerRef = useRef(null);
  const [speed, setSpeed] = useState(250)

  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setTextHeight(height);
      setAnimationDuration((height + 425) / speed)
    }
    // Update the key to force re-render and restart animation
    setUniqueKey(prevKey => prevKey + 1);
  }, [text ]);

  useEffect(()=>{
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setAnimationDuration((height + 425) / speed)
    }
  }, [speed])

  return (<div>
    <div className="scroll-container">
      <div
        key={uniqueKey}
        ref={containerRef}
        className="scrolling-text"
        style={{ '--text-height': `${textHeight}px`, '--animationDuration': `${animationDuration}s` }}
      >
        {text}
      </div>
    </div>
    <div>
      S:{speed}
      <input
        type="range"
        min={0.001}
        max={500}
        value={speed}
        onChange={e=>setSpeed(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  </div>);
};

export default ScrollingText;
