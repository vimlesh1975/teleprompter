'use client';
import { useState, useEffect, useRef } from 'react';
import NewWindow from './components/NewWindow';
import Scroll from './components/Scroll';

const startPosition = 150;
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
  const [newPosition, setNewPosition] = useState(startPosition);
  const [tempSpeed, setTempSpeed] = useState(150);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
  const [showNewWindow, setShowNewWindow] = useState(false);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const newWindowRef = useRef(null);


  const textRef = useRef(null);

  const handleCloseNewWindow = () => {
    setShowNewWindow(false);
  };

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
    setCurrentStoryNumber(i + 1);

    // Calculate and update skipped positions
    const newLoggedPositions = new Set();
    //  for (let index = 0; index < (i+1) * 3; index += 3) {
    //    newLoggedPositions.add(index);
    //  }
    //  console.log(newLoggedPositions)
    setLoggedPositions(newLoggedPositions);
    setDoubleClickedPosition(i);

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
              rows="27"
              cols="45"
              style={{ fontSize: 20 }}
              disabled
            />
          </div>

        </div>
        <div>
          {!showNewWindow && <Scroll newPosition={newPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />}


          {showNewWindow && (
            <NewWindow onClose={handleCloseNewWindow} newWindowRef={newWindowRef}>
              <Scroll newPosition={newPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
            </NewWindow>
          )}

          <div onContextMenu={(e) => {
            setSpeed(0);
            e.preventDefault();
          }}
            style={{ textAlign: 'center', border: '1px solid red', minHeight: 100, position: 'absolute', top: 535 }}
          >
            <button onClick={() => setSpeed(-200)}> Speed -200</button>
            <button onClick={() => setSpeed(0)}> Pause</button>
            <button onClick={() => setSpeed(200)}> Speed 200</button>
            Speed: {speed}
            <input
              type="range"
              min={-500}
              max={500}
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              style={{ width: '60%' }}
            />
            <button onClick={() => {
              if (showNewWindow) {
                newWindowRef.current.close();
              }
              setNewPosition(textRef.current.offsetTop)
              setShowNewWindow(!showNewWindow);
            }}>{showNewWindow ? 'Close New Window' : 'Open New Window'}</button>
          </div>
        </div>
      </div>
    </div >
  );
}
