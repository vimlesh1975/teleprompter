import React, { useEffect, useState } from 'react';
import './ScrollingText.css';

const ScrollingText = ({ text }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [text]);

  return (
    <div className="scroll-container">
      <div key={key} className="scrolling-text">
        {text}
      </div>
    </div>
  );
};

export default ScrollingText;
