'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import NewWindow from './components/NewWindow';
import Scroll from './components/Scroll';
import io from 'socket.io-client';
import debounce from 'lodash.debounce'; // Importing debounce from lodash
import dynamic from 'next/dynamic';

import Casparcg from './Casparcg';
const Clock = dynamic(() => import('./components/Clock'), { ssr: false });

// const startPosition = 150;
const socket = io();
socket.on('connect', () => {
  console.log('SOCKET CONNECTED! from main page', socket.id);
});

export default function Home() {

  const [startPosition, setStartPosition] = useState(150);
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
  const [tempSpeed, setTempSpeed] = useState(0);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
  const [showNewWindow, setShowNewWindow] = useState(false);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const [fontSize, setFontSize] = useState(39);

  const newWindowRef = useRef(null);


  const textRef = useRef(null);

  const endpoint = async (str) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify the content type as JSON
        // You may include other headers as needed
      },
      body: JSON.stringify(str), // Convert the data to JSON format
    };
    const aa = await fetch('/api/casparcg', requestOptions);
    if (str.action === 'connect' || str.action === 'disconnect') {
      setConnected(await aa.json());
    }
  };

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
          setSpeed(val => Number(val) + 1);
          break;
        case 'ArrowDown':
          setSpeed(val => val - 1);
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
      setCurrentSlugName(slugs[newIndex].SlugName);
      setScriptID(slugs[newIndex].ScriptID);
      handleDoubleClick(newIndex);
      return newIndex;
    });
  }, [slugs, handleDoubleClick]);


  useEffect(() => {

    const handleButtonDown = debounce((msg) => {
      console.log(msg)
      if (msg === 1) {
        setSpeed(0)
      }
      else if (msg === 2) {
        setSpeed(-3)
      }
      else if (msg === 3) {
        setSpeed(val => val - 1)
      }
      else if (msg === 4) {
        fromStart();
      } else if (msg === 5) {
        setSpeed(1);
      } else if (msg === 6) {
        setSpeed(2)
      } else if (msg === 7) {
        setSpeed(3)
      } else if (msg === 8) {
        setSpeed(4)
      } else if (msg === 9) {
        setSpeed(val => val + 1)
      } else if (msg === 10) {
        onclickSlug(slugs[9], 9);
        handleDoubleClick(9);
      } else if (msg === 11) {
        onclickSlug(slugs[19], 19);
        handleDoubleClick(19);
      } else if (msg === 12) {
        onclickSlug(slugs[29], 29);
        handleDoubleClick(29);
      }
      else if (msg === 13) {
        onclickSlug(slugs[39], 39);
        handleDoubleClick(39);
      }
      else if (msg === 14) {
        previous();
      }
      else if (msg === 15) {
        next();
      }
    }, 300); // Debounce with 300ms delay

    const handleJogdir = debounce((msg) => {
      console.log(msg)
      if (msg === 1) {
        setSpeed(2)
      }
      else if (msg === -1) {
        setSpeed(-2)
      }
    }, 300); // Debounce with 300ms delay

    const handleShuttle = debounce((msg) => {
      console.log(msg)
      setSpeed(msg)
    }, 300); // Debounce with 300ms delay


    socket.on('buttondown1', handleButtonDown);
    socket.on('jog-dir1', handleJogdir);
    socket.on('shuttle1', handleShuttle);

    return () => {
      socket.off('buttondown1', handleButtonDown);
      socket.off('jog-dir1', handleJogdir);
      socket.off('shuttle1', handleShuttle);
      // socket.disconnect();
    };
  }, [next, previous, speed, setSpeed, fromStart, handleDoubleClick, slugs, onclickSlug])

  useEffect(() => {
    setCurrentSlug(currentStoryNumber - 1);
    setScriptID(slugs[currentStoryNumber - 1]?.ScriptID);
    setCurrentSlugName(slugs[currentStoryNumber - 1]?.SlugName);
  }, [currentStoryNumber, slugs])


  function replaceCRLFInArray(inputArray) {
    // Ensure inputArray is an array of strings
    if (!Array.isArray(inputArray)) {
      throw new Error('Input is not an array');
    }
  
    // Map over the array and replace CRLF characters in each string
    return inputArray.map((inputString) => {
      // Ensure each element is a string
      if (typeof inputString !== 'string') {
        throw new Error('Array element is not a string');
      }
  
      // Replace all occurrences of \r, \n, or \r\n with an empty string
      return inputString.replace(/(\r\n|\n|\r)/g, 'CRLF');
    });
  }
  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setStartPosition(${startPosition})`,
    })
  }, [startPosition])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setAllContent1(${JSON.stringify(replaceCRLFInArray(allContent)).replaceAll('"', '\\"')})`,
    })
  }, [allContent])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setSpeed(${speed})`,
    })
  }, [speed])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setFontSize(${fontSize})`,
    })
  }, [fontSize])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setShowClock(${showClock})`,
    })
  }, [showClock])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setNewsReaderText('${newsReaderText}')`,
    })
  }, [newsReaderText])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setDoubleClickedPosition(${doubleClickedPosition})`,
    })
  }, [doubleClickedPosition])
  
  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setSlugs(${JSON.stringify(slugs.map(item => item.SlugName))})`,
    })
  }, [slugs])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setCurrentSlug(${currentSlug})`,
    })
  }, [currentSlug])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setSelectedRunOrderTitle(${selectedRunOrderTitle})`,
    })
  }, [selectedRunOrderTitle])

  useEffect(() => {
    endpoint({
      action: 'endpoint',
      command: `call 1-2 setNewPosition(${newPosition})`,
    })
  }, [newPosition])

  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex' }}>
        <div>
          <div>
            Run Orders:
            <select value={selectedRunOrderTitle} onChange={handleSelectionChange}>
              <option value="" disabled>Select a Run Order</option>
              {runOrderTitles?.map((runOrderTitle, i) => (
                <option key={i} value={runOrderTitle.title}>
                  {runOrderTitle.title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 348, maxWidth: 348, maxHeight: '90vh', overflow: 'auto' }}>
            {slugs?.map((val, i) => (
              <div
                key={i}
                onClick={() => {
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
          <div style={{ border: '1px solid red', marginBottom: 10 }}>
            <Casparcg />
          </div>
          <div style={{ border: '1px solid red', marginBottom: 10 }}>
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
          <div style={{ border: '1px solid red', marginBottom: 10 }}>
            <div>
              <button onClick={() => setNewsReaderText('Go Fast...')}>Go fast</button>
              <button onClick={() => setNewsReaderText('Wait...')}>Wait</button>
              <button onClick={() => setNewsReaderText('.')}>Clear</button>
              <input checked={showClock} type="checkbox" onChange={() => setShowClock(!showClock)} /> <span> Show Clock:</span>{" "}

              <button onClick={() => setNewsReaderText('Go Slow...')}>Go Slow</button>
              <button onClick={() => setNewsReaderText('Continue...')}>Continue...</button>
              <button onClick={() => setNewsReaderText('Stop...')}>Stop</button>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: 'blue', width: 500, color: 'white' }}>{selectedRunOrderTitle} {currentSlugName}</div>
            <textarea
              value={content}
              rows="13"
              cols="30"
              style={{ fontSize: 39 }}
              disabled
            />
          </div>

        </div>
        <div>
          <div>
            {!showNewWindow && <Scroll fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />}
            {showNewWindow && (
              <NewWindow onClose={handleCloseNewWindow} newWindowRef={newWindowRef} >
                <Scroll fontSize={fontSize} setCurrentSlug={setCurrentSlug} newPosition={newPosition} setNewPosition={setNewPosition} doubleClickedPosition={doubleClickedPosition} textRef={textRef} startPosition={startPosition} allContent={allContent} showClock={showClock} loggedPositions={loggedPositions} setLoggedPositions={setLoggedPositions} currentStoryNumber={currentStoryNumber} setCurrentStoryNumber={setCurrentStoryNumber} speed={speed} selectedRunOrderTitle={selectedRunOrderTitle} slugs={slugs} newsReaderText={newsReaderText} />
              </NewWindow>
            )}
          </div>
          <div onContextMenu={(e) => {
            e.preventDefault();
            // setSpeed(0);
            if (speed === 0) {
              setSpeed(tempSpeed);
            }
            else {
              setTempSpeed(speed);
              setSpeed(0);
            }
          }} style={{ textAlign: 'center', border: '1px solid red', minWidth: 600, minHeight: 70, position: 'absolute', top: 535 }}>
            <div>
              <button onClick={() => setSpeed(val => val - 1)}>-</button>
              <button onClick={() => setSpeed(-7)}>-7</button>
              <button onClick={() => setSpeed(-6)}>-6</button>
              <button onClick={() => setSpeed(-5)}> -5</button>
              <button onClick={() => setSpeed(-4)}> -4</button>
              <button onClick={() => setSpeed(-3)}> -3</button>
              <button onClick={() => setSpeed(-2)}> -2</button>
              <button onClick={() => setSpeed(-1)}> -1</button>
              <button onClick={() => {
                // setSpeed(0)
                if (speed === 0) {
                  setSpeed(tempSpeed);
                }
                else {
                  setTempSpeed(speed);
                  setSpeed(0);
                }
              }}> {speed ? 'Pause' : 'Resume'}</button>
              <button onClick={() => setSpeed(1)}> 1</button>
              <button onClick={() => setSpeed(2)}> 2</button>
              <button onClick={() => setSpeed(3)}> 3</button>
              <button onClick={() => setSpeed(4)}> 4</button>
              <button onClick={() => setSpeed(5)}> 5</button>
              <button onClick={() => setSpeed(6)}>6</button>
              <button onClick={() => setSpeed(7)}>7</button>
              <button onClick={() => setSpeed(val => parseInt(val) + 1)}>+1</button>
            </div>
            <div>
              Speed: {speed}
              <input
                type="range"
                min={-20}
                max={20}
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                style={{ width: '60%' }}
              />
            </div>
            <div>
              <button onClick={() => {
                if (showNewWindow) {
                  newWindowRef.current.close();
                }
                setNewPosition(textRef.current.offsetTop)
                setShowNewWindow(!showNewWindow);
              }}>{showNewWindow ? 'Close New Window' : 'Open New Window'}</button>

            </div>
            <div>
              Font Size:<input type='number' value={fontSize} style={{ width: 50 }} onChange={e => setFontSize(e.target.value)} />
              Start Position:<input type='number' value={startPosition} style={{ width: 50 }} onChange={e => {
                setStartPosition(e.target.value);
              }} />
              {/* <Clock /> */}
            </div>
          </div>
        </div>

      </div>
    </div >
  );
}
