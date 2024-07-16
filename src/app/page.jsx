'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './components/ScrollingText.css';
import Triangles from './components/Triangles';
import dynamic from 'next/dynamic';
const Clock = dynamic(() => import('./components/Clock'), { ssr: false });

export default function Home() {
  const [speed, setSpeed] = useState(0);
  const [connected, setConnected] = useState(false);
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
  const [startPosition, setStartPosition] = useState(150);
  const [tempSpeed, setTempSpeed] = useState(150);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);




  const containerRef = useRef(null);
  const textRef = useRef(null);
  const contentRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setSpeed(val => val + 20);
          break;
        case 'ArrowDown':
          setSpeed(val => val - 20);
          break;
        case ' ':
          if (speed === 0) {
            setSpeed(tempSpeed);
          }
          else {
            setTempSpeed(speed);
            setSpeed(0);
          }

          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [speed, tempSpeed]);


  const updateCurrentStory = useCallback((curstory, curbulletin) => {
    // Your API call here
    fetch('/api/currentStory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curstory, curbulletin }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  // Scroll text effect
  useEffect(() => {
    let animationFrameId;

    const scrollText = async () => {
      if (textRef.current) {
        const currentTop = textRef.current.offsetTop;
        const newTop = currentTop - (speed / 60); // Assuming 60 frames per second
        textRef.current.style.top = `${newTop}px`;

        // Determine which div is at startPosition
        const startPositionDivIndex = contentRefs.current.findIndex((ref) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            return rect.top <= startPosition - 20 && rect.bottom > startPosition - 20;
          }
          return 0
        });

        if (startPositionDivIndex !== -1) {
          if (startPositionDivIndex % 3 === 0) {
            if (!loggedPositions.has(startPositionDivIndex)) {
              const curstory = (startPositionDivIndex / 3) + 1;
              setCurrentStoryNumber(curstory);
              setLoggedPositions((prev) => new Set(prev).add(startPositionDivIndex));
            }
          }
        }

      }
      animationFrameId = requestAnimationFrame(scrollText);
    };

    animationFrameId = requestAnimationFrame(scrollText);
    return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
  }, [speed]);


  useEffect(() => {
    updateCurrentStory(currentStoryNumber, selectedRunOrderTitle)
  }, [currentStoryNumber])

  // Handle connection state
  const endpoint = async (str) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(str),
    };
    const response = await fetch('/api', requestOptions);
    if (str.action === 'connect' || str.action === 'disconnect') {
      setConnected(await response.json());
    }
  };

  // Fetch run order titles on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/newsid');
        const data = await res.json();
        setRunOrderTitles(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  // Fetch slugs based on selected run order title
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/slug?param1=${selectedRunOrderTitle}`);
        const data = await res.json();
        setSlugs(data.data);
        fetchAllContent(data.data, 0);
      } catch (error) {
        console.error(error);
      }
    }
    if (selectedRunOrderTitle) {
      fetchData();
    }
  }, [selectedRunOrderTitle]);

  // Fetch script content based on script ID
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/script?ScriptID=${scriptID}`);
        const data = await res.json();
        setContent(data.data?.Script);
      } catch (error) {
        console.error(error);
      }
    }
    if (scriptID) {
      fetchData();
    }
  }, [scriptID]);

  // Fetch all content for scrolling
  const fetchAllContent = async (slugs, startNumber) => {
    const data1 = new Array(slugs.length * 3);
    const fetchPromises = slugs.map((slug, i) =>
      fetch(`/api/script?ScriptID=${slug.ScriptID}`)
        .then(async (res) => {
          const dd = await res.json();
          const data = dd.data?.Script;
          data1[i * 3] = `${startNumber + i + 1} ${slug.SlugName}${slug.Media ? ' - Visual' : ' -No Visual'}`;
          data1[i * 3 + 1] = `${data}`;
          data1[i * 3 + 2] = `--------------`;
        })
        .catch((error) => console.error('Error fetching content:', error))
    );
    await Promise.all(fetchPromises);
    setAllContent(data1.filter((item) => item !== undefined));
  };

  // Handle selection change
  const handleSelectionChange = (e) => {
    const value = e.target.value;
    setSelectedRunOrderTitle(value);
    setCurrentSlug(0);
    if (slugs.length > 0) {
      setCurrentSlugName(slugs[0].SlugName);
      setScriptID(slugs[0].ScriptID);
    }
  };

  // Handle double-click event
  const handleDoubleClick = (i) => {
    const newSlugs = slugs.slice(i);
    fetchAllContent(newSlugs, i);
    setSpeed(0);
    if (textRef.current) {
      textRef.current.style.top = `${startPosition}px`;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div>
          <div>
            Run Orders:
            <select value={selectedRunOrderTitle} onChange={handleSelectionChange}>
              <option value="" disabled>Select a Run Order</option>
              {runOrderTitles.map((runOrderTitle, i) => (
                <option key={i} value={runOrderTitle.title}>
                  {runOrderTitle.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 300, maxHeight: '90vh', overflow: 'auto' }}>
            {slugs.map((val, i) => (
              <div
                key={i}
                onClick={() => {
                  setScriptID(val.ScriptID);
                  setCurrentSlug(i);
                  setCurrentSlugName(val.SlugName);
                }}
                onDoubleClick={() => handleDoubleClick(i)}
                style={{ backgroundColor: currentSlug === i ? 'green' : '#E7DBD8', margin: 10 }}
              >
                {i + 1} <label style={{ cursor: 'pointer' }}>{val.SlugName}</label> <br />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => {
              setCurrentSlug(0);
              handleDoubleClick(0);
              if (slugs.length > 0) {
                setCurrentSlugName(slugs[0].SlugName);
                setScriptID(slugs[0].ScriptID);
              }
            }}>From Start</button>
            <button onClick={() => {
              let newIndex = currentSlug - 1;
              if (newIndex < 0) {
                newIndex = slugs.length - 1;
              }
              setCurrentSlug(newIndex);
              handleDoubleClick(newIndex);
              setCurrentSlugName(slugs[newIndex].SlugName);
              setScriptID(slugs[newIndex].ScriptID);
            }}>Previous</button>
            <button onClick={() => {
              let newIndex = currentSlug + 1;
              if (newIndex >= slugs.length) {
                newIndex = 0;
              }
              setCurrentSlug(newIndex);
              handleDoubleClick(newIndex);
              setCurrentSlugName(slugs[newIndex].SlugName);
              setScriptID(slugs[newIndex].ScriptID);
            }}>Next</button>
            <button onClick={() => {
              const lastIndex = slugs.length - 1;
              setCurrentSlug(lastIndex);
              handleDoubleClick(lastIndex);
              setCurrentSlugName(slugs[lastIndex].SlugName);
              setScriptID(slugs[lastIndex].ScriptID);
            }}>Go to Last</button>
          </div>
          <div>
            <div>
              <button onClick={() => setNewsReaderText('Go Fast...')}>Go fast</button>
              <button onClick={() => setNewsReaderText('Wait...')}>Wait</button>
              <button onClick={() => setNewsReaderText('.')}>Clear</button>
              <span> Show Clock:</span>{" "} <input checked={showClock} type="checkbox" onChange={() => setShowClock(!showClock)} />
            </div>
            <div>
              <button onClick={() => setNewsReaderText('Go Slow...')}>Go Slow</button>
              <button onClick={() => setNewsReaderText('Continue...')}>Continue...</button>
              <button onClick={() => setNewsReaderText('Stop...')}>Stop</button>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: 'blue', color: 'white' }}>{selectedRunOrderTitle} {currentSlugName}</div>
            <textarea
              value={content}
              rows="15"
              cols="45"
              style={{ fontSize: 20 }}
              disabled
            />
          </div>

        </div>
        <div>
          <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 500, minHeight: 500, border: '1px solid black' }}>

            <div style={{ backgroundColor: 'white', color: 'red', fontSize: 18, fontWeight: 'bolder' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>{`Cur: ${currentStoryNumber} (${currentStoryNumber}/${slugs.length})`}</div>
                <div>{newsReaderText}</div>
                <div>{showClock ? '' : '.'}</div>
                <div style={{ display: showClock ? 'inline' : 'none' }}><Clock /></div>
              </div>
            </div>


            <div ref={containerRef} className="scroll-container">
              <div ref={textRef} className="scrolling-text">
                {allContent.map((line, i) => (
                  <div key={i} ref={(el) => (contentRefs.current[i] = el)} style={{ backgroundColor: i % 3 === 0 ? 'blue' : 'transparent' }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', top: startPosition, scale: 1 }}>
              <Triangles />
            </div>
            <div>
              Speed: {speed}
              <input
                type="range"
                min={-500}
                max={500}
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div onContextMenu={(e) => {
              setSpeed(0);
              e.preventDefault();
            }}
              style={{ textAlign: 'center', border: '1px solid red', minHeight: 100 }}>
              <button onClick={() => setSpeed(-200)}> Speed -200</button>
              <button onClick={() => setSpeed(0)}> Pause</button>
              <button onClick={() => setSpeed(200)}> Speed 200</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
