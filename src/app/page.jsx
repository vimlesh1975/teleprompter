'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import NewWindow from './components/NewWindow';
import Scroll from './components/Scroll';
import io from 'socket.io-client';
import debounce from 'lodash.debounce'; // Importing debounce from lodash

import Casparcg from './Casparcg';

const startPosition = 150;
export default function Home() {
  const [speed, setSpeed] = useState(0);
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
  const socketRef = useRef(null);

  const handleCloseNewWindow = () => {
    setShowNewWindow(false);
  };


  const onclickSlug = (val, i) => {
    if (i < slugs.length) {
      setScriptID(val.ScriptID);
      setCurrentSlug(i);
      setCurrentSlugName(val.SlugName);
    }
  }


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
    if (i < slugs.length) {
      const newSlugs = slugs.slice(i);
      fetchAllContent(newSlugs, i);
      setSpeed(0);
      setCurrentStoryNumber(i + 1);
      const newLoggedPositions = new Set();
      setLoggedPositions(newLoggedPositions);
      setDoubleClickedPosition(i);
      setNewPosition(startPosition);
    }
  };
  const fromStart = () => {
    setCurrentSlug(0);
    handleDoubleClick(0);
    if (slugs.length > 0) {
      setCurrentSlugName(slugs[0].SlugName);
      setScriptID(slugs[0].ScriptID);
    }
  }

  const previous = () => {
    setCurrentSlug((prevSlug) => {
      let newIndex = prevSlug - 1;
      if (newIndex < 0) {
        newIndex = slugs.length - 1;
      }
      handleDoubleClick(newIndex);
      setCurrentSlugName(slugs[newIndex].SlugName);
      setScriptID(slugs[newIndex].ScriptID);
      return newIndex;
    });
  };

  const next = useCallback(() => {
    setCurrentSlug((prevSlug) => {
      let newIndex = prevSlug + 1;
      if (newIndex >= slugs.length) {
        newIndex = 0;
      }
      console.log("Inside setCurrentSlug:", newIndex);
      setCurrentSlugName(slugs[newIndex].SlugName);
      setScriptID(slugs[newIndex].ScriptID);
      handleDoubleClick(newIndex);
      return newIndex;
    });
  }, [slugs, handleDoubleClick]);
  const handleButtonDown = useCallback(debounce((msg) => {
    console.log(msg);
    switch (msg) {
      case 1:
        setSpeed(0);
        break;
      case 2:
        setSpeed(-3);
        break;
      case 3:
        setSpeed(val => val - 1);
        break;
      case 4:
        fromStart();
        break;
      case 5:
        setSpeed(1);
        break;
      case 6:
        setSpeed(2);
        break;
      case 7:
        setSpeed(3);
        break;
      case 8:
        setSpeed(4);
        break;
      case 9:
        setSpeed(5);
        break;
      case 10:
        onclickSlug(slugs[9], 9);
        handleDoubleClick(9);
        break;
      case 11:
        onclickSlug(slugs[19], 19);
        handleDoubleClick(19);
        break;
      case 12:
        onclickSlug(slugs[29], 29);
        handleDoubleClick(29);
        break;
      case 13:
        onclickSlug(slugs[39], 39);
        handleDoubleClick(39);
        break;
      case 14:
        previous();
        break;
      case 15:
        next();
        break;
      default:
        break;
    }
  }, 300), [setSpeed, fromStart, onclickSlug, handleDoubleClick, slugs, previous, next]);

  const handleJogdir = useCallback(debounce((msg) => {
    console.log(msg);
    if (msg === 1) {
      setSpeed(2);
    } else if (msg === -1) {
      setSpeed(-2);
    }
  }, 300), [setSpeed]);

  const handleShuttle = useCallback(debounce((msg) => {
    console.log(msg);
    setSpeed(msg);
  }, 300), [setSpeed]);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io();
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('SOCKET CONNECTED!', socket.id);
      });
      socket.on('disconnect', () => {
        socket.off('buttondown1', handleButtonDown);
        socket.off('jog-dir1', handleJogdir);
        socket.off('shuttle1', handleShuttle);
      });

      socket.on('buttondown1', handleButtonDown);
      socket.on('jog-dir1', handleJogdir);
      socket.on('shuttle1', handleShuttle);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [handleButtonDown, handleJogdir, handleShuttle]);
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
                  // setScriptID(val.ScriptID);
                  // setCurrentSlug(i);
                  // setCurrentSlugName(val.SlugName);

                  onclickSlug(val, i)
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
              fromStart()
            }}>From Start</button>
            <button onClick={previous}>Previous</button>
            <button onClick={next}>Next</button>
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
          {!showNewWindow && <Scroll newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />}


          {showNewWindow && (
            <NewWindow onClose={handleCloseNewWindow} newWindowRef={newWindowRef} >
              <Scroll newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
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
        {/* <Casparcg /> */}
        <button onClick={() => {
          // next1()
          console.log(slugs.length)
        }

        }
        >test</button>
      </div>
    </div >
  );
}
