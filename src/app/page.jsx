"use client";
import { useDispatch, useSelector } from 'react-redux';

import { useState, useEffect, useRef, useCallback } from "react";
import NewWindow from "./components/NewWindow";
import Scroll from "./components/Scroll";
import io from "socket.io-client";
import debounce from "lodash.debounce"; // Importing debounce from lodash

import Casparcg from "./Casparcg";
import Timer from "./components/Timer";
// import GraphicsAndVideo from './components/GraphicsAndVideo'
import TTS from './components/TTS.jsx'
import SrollView from './components/SrollView';
import { changeStoryLines, changeCrossedLines, changenewdatabase } from './store/store'; // Adjust the path as needed

// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import 'react-tabs/style/react-tabs.css';



// const scrollWidth = 600;
const scrollHeight = 440;
const scrollWidth = 782;//scrollHeight * 16 / 9=782.22;

var socket;


export default function Home() {
  const dispatch = useDispatch();
  const storyLines = useSelector((state) => state.storyLinesReducer.storyLines);
  const crossedLines = useSelector((state) => state.crossedLinesReducer.crossedLines);
  const newdatabase = useSelector((state) => state.newdatabaseReducer.newdatabase);

  const [startPosition, setStartPosition] = useState(150);
  const [speed, setSpeed] = useState(0);
  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState("");
  const [slugs, setSlugs] = useState([]);
  const [scriptID, setScriptID] = useState("");
  const [currentSlug, setCurrentSlug] = useState(0);
  const [currentSlugName, setCurrentSlugName] = useState("");
  // const [content, setContent] = useState("");
  const [allContent, setAllContent] = useState([]);
  const [newsReaderText, setNewsReaderText] = useState("Continue...");
  const [showClock, setShowClock] = useState(true);
  const [newPosition, setNewPosition] = useState(startPosition);
  const [tempSpeed, setTempSpeed] = useState(0);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(-1);
  const [showNewWindow, setShowNewWindow] = useState(false);
  const [showNewWindow2, setShowNewWindow2] = useState(false);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const [fontSize, setFontSize] = useState(39);
  const [stopAfterStoryChange, setStopAfterStoryChange] = useState(false);
  const [showReactComponent, setShowReactComponent] = useState(false);
  const [stopOnNext, setStopOnNext] = useState(false);
  const [latestDate, setLatestDate] = useState(null);
  const [allowUnApproved, setAllowUnApproved] = useState(true);
  const [DB_NAME, setDB_NAME] = useState('c1news');
  const [DB_HOST, setDB_HOST] = useState('localhost');
  const [CASPAR_HOST, setCASPAR_HOST] = useState('127.0.0.1');
  const [showSettings, setShowSettings] = useState(false);

  const [keyPressed, setKeyPressed] = useState('');

  const newWindowRef = useRef(null);
  const newWindowRef2 = useRef(null);
  const textRef = useRef(null);

  const [serverAlive, setServerAlive] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2024-12-05');

  const [usedStory, setUsedStory] = useState([]);

  const [sendUsedStory, setSendUsedStory] = useState(false);



  const updateCurrentStory = useCallback((curstory, curbulletin, ScriptID, usedStory) => {
    // console.log('log from scroll ', curstory, curbulletin, ScriptID);
    if (curbulletin === null) return;
    if (!ScriptID) return;

    fetch('/api/currentStory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curstory, curbulletin, ScriptID:sendUsedStory?ScriptID:123456789, usedStory: sendUsedStory ? usedStory : [] }),
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [sendUsedStory]);

  useEffect(() => {
    updateCurrentStory(currentStoryNumber, selectedRunOrderTitle, slugs[currentStoryNumber - 1]?.ScriptID, usedStory);
  }, [currentStoryNumber, selectedRunOrderTitle, updateCurrentStory, slugs, usedStory]);


  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date)

    setSpeed(0);
    setDoubleClickedPosition(0);
  };

  useEffect(() => {
    socket = io();
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED! from main page", socket.id);
    });
    socket.on("newdatabase", (data) => {
      dispatch(changenewdatabase(data));
    });



    socket.on('connect', () => {
      console.log('Connected to server');
      setServerAlive(true);

    });

    socket.on('connect_error', (error) => {
      setServerAlive(false);
      // connectbutton.current.style.backgroundColor = "red";
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setServerAlive(false);
      // connectbutton.current.style.backgroundColor = "red";
    });

    return () => {
      socket.disconnect();
      socket.close();
    }
  }, [])


  useEffect(() => {
    // Event listener function
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleDoubleClick(parseInt(keyPressed) - 1);
        setKeyPressed('');
      }
      else {
        if (!isNaN(event.key)) {
          setKeyPressed(val => val + event.key);
        }
      }
    };

    // Add event listener on mount
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyPressed]); // Empty dependency array ensures it runs only once when component mounts

  const changeDB_NAME = async () => {
    try {
      const str = { DB_NAME, DB_HOST, CASPAR_HOST }
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
        },
        body: JSON.stringify(str), // Convert the data to JSON format
      };
      await fetch("/api/setdbname", requestOptions);
      setTimeout(() => {
        fetchNewsId()
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  const getDB_NAME = async () => {
    try {
      const res = await fetch('/api/setdbname')
      const data = await res.json();
      setDB_NAME(data.DB_NAME);
      setDB_HOST(data.DB_HOST);
      setCASPAR_HOST(data.CASPAR_HOST);
    } catch (error) {
      console.error(error);
      setDB_NAME('not set');
      setDB_HOST('not set');
      setCASPAR_HOST('not set');
    }
  }


  useEffect(() => {
    getDB_NAME();
  }, [])

  useEffect(() => {
    const savedData = localStorage.getItem("WebTelePrompter");
    if (savedData) {
      const dataObject = JSON.parse(savedData);
      if (dataObject.fontSize) {
        setFontSize(dataObject.fontSize);
      }
      if (dataObject.startPosition !== undefined) {
        setStartPosition(dataObject.startPosition);
      }
    } else {
      localStorage.setItem(
        "WebTelePrompter",
        JSON.stringify({ fontSize, startPosition })
      );
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const savedData = localStorage.getItem("WebTelePrompter");
      const dataObject = savedData ? JSON.parse(savedData) : {};

      localStorage.setItem(
        "WebTelePrompter",
        JSON.stringify({ ...dataObject, fontSize, startPosition })
      );
    }, 1000);
  }, [fontSize, startPosition]);

  const endpoint = async (str) => {
    if (showReactComponent) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
        },
        body: JSON.stringify(str), // Convert the data to JSON format
      };
      const aa = await fetch("/api/casparcg", requestOptions);
    }
  };

  const handleCloseNewWindow = () => {
    setShowNewWindow(false);
  };

  const handleCloseNewWindow2 = () => {
    setShowNewWindow2(false);
  };

  const timerFunction = async () => {
    if (selectedRunOrderTitle === '') {
      return;
    }
    try {
      const res = await fetch(
        `/api/ShowRunOrder?NewsId=${selectedRunOrderTitle}&date=${selectedDate}`
      );
      const data = await res.json();

      const newSlugsTotal = data.data;
      const LastModifiedTimeTotal = newSlugsTotal.map(
        (slug) => slug.LastModifiedTime
      );
      const ScriptLastModifiedTimeTotal = newSlugsTotal.map(
        (slug) => slug.ScriptLastModifiedTime
      );
      const dateArrayTotal = [
        ...LastModifiedTimeTotal,
        ...ScriptLastModifiedTimeTotal,
      ];
      const newLatestDateTotal = new Date(
        Math.max(...dateArrayTotal.map((date) => new Date(date)))
      );

      if (
        latestDate === null ||
        newLatestDateTotal > latestDate ||
        data.data.length !== slugs.length
      ) {
        // console.log( `'There is Update at ${newLatestDateTotal.toLocaleString()}'`   );
        setLatestDate(newLatestDateTotal);
        setSlugs(data.data);
      } else {
        // console.log(`'No Update at all'`);
      }

      const newSlugs = data.data.slice(doubleClickedPosition);
      const LastModifiedTime = newSlugs.map((slug) => slug.LastModifiedTime);
      const ScriptLastModifiedTime = newSlugs.map(
        (slug) => slug.ScriptLastModifiedTime
      );
      const dateArray = [...LastModifiedTime, ...ScriptLastModifiedTime];
      const newLatestDate = new Date(
        Math.max(...dateArray.map((date) => new Date(date)))
      );

      if (
        latestDate === null ||
        newLatestDate > latestDate ||
        data.data.length !== slugs.length
      ) {
        if (
          data.data[currentStoryNumber - 1]?.DropStory === 1 ||
          data.data[currentStoryNumber - 1]?.Approval === 0
        ) {
          // console.log("current story dropped or not disapproved");
          handleDoubleClick(currentStoryNumber);
        } else {
          fetchAllContent(newSlugs, doubleClickedPosition);
        }
      } else {
        // console.log("No update below current story");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onclickSlug = (val, i) => {
    if (i < slugs.length) {
      setScriptID(val.ScriptID);
      setCurrentSlug(i);
      setCurrentSlugName(val.SlugName);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setSpeed((val) => Number(val) + 1);
          break;
        case "ArrowDown":
          setSpeed((val) => val - 1);
          break;
        case " ":
          if (speed === 0) {
            setSpeed(tempSpeed);
          } else {
            setTempSpeed(speed);
            setSpeed(0);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [speed, tempSpeed]);

  // Fetch run order titles on component mount

  const fetchNewsId = async () => {
    try {
      const res = await fetch("/api/newsid");
      const data = await res.json();
      setRunOrderTitles(data.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchNewsId()
  }, []);

  // Fetch slugs based on selected run order title
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/ShowRunOrder?NewsId=${selectedRunOrderTitle}&date=${selectedDate}`
        );
        const data = await res.json();
        setSlugs(data.data);
        setUsedStory([data.data[0]?.ScriptID]);
        fetchAllContent(data.data, 0);
      } catch (error) {
        console.error(error);
      }
    }
    if (selectedRunOrderTitle) {
      fetchData();
      setCurrentStoryNumber(1);
    }
  }, [selectedRunOrderTitle, selectedDate]);

  // const content = slugs[currentSlug]?.Script;

  const isVideoPresent = (slug) => {
    const aa = [slug.media1, slug.media2, slug.media3, slug.media4, slug.media5];
    const allValid = aa.some(item => item !== null && item !== "");
    const isVideoPresent = newdatabase ? allValid : slug?.Media;
    return isVideoPresent;
  }

  const fetchAllContent = (slicedSlugs, startNumber) => {
    if (!Array.isArray(slicedSlugs) || slicedSlugs.length === 0) {
      return;
    }

    const data1 = new Array(slicedSlugs.length * 3);
    try {
      slicedSlugs.forEach((slug, i) => {

        // const aa = [slug.media1, slug.media2, slug.media3, slug.media4, slug.media5];
        // const allValid = aa.some(item => item !== null && item !== "");
        // const isVideoPresent =newdatabase? allValid:slug?.Media;

        if (!slug?.DropStory && (slug?.Approval || allowUnApproved)) {
          data1[i * 3] = `${startNumber + i + 1} ${slug?.SlugName}${isVideoPresent(slug) ? " - Visual" : " - No Visual"
            }`;
          data1[i * 3 + 1] = `${slug.Script}`;
          data1[i * 3 + 2] = `--------------`;
        } else {
          data1[i * 3] = `${startNumber + i + 1} ${slug?.DropStory ? "Story Dropped" : "Story UnApproved"
            }`;
          data1[i * 3 + 1] = ` `;
          data1[i * 3 + 2] = ``;
        }
      });

      setAllContent(data1.filter((item) => item !== undefined));
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const handleSelectionChange = (e) => {
    setSpeed(0);
    setDoubleClickedPosition(0);
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
    console.log('handleDoubleClick called', i)

    sendtoCasparafterDoubleClick(i)
    setStopOnNext(true); // Signal to skip the callback
    if (i < slugs.length) {
      const newSlugs = slugs.slice(i);
      fetchAllContent(newSlugs, i);
      setSpeed(0);
      setCurrentStoryNumber(i + 1);
      const newLoggedPositions = new Set();
      setLoggedPositions(newLoggedPositions);
      setDoubleClickedPosition(i);
      setNewPosition(startPosition);
      endpoint({
        action: "endpoint",
        command: `call 1-97 setNewPosition(${startPosition})`,
      });
    }
  };
  const fromStart = () => {
    setCurrentSlug(0);
    handleDoubleClick(0);
    if (slugs.length > 0) {
      setCurrentSlugName(slugs[0].SlugName);
      setScriptID(slugs[0].ScriptID);
    }
  };

  const previous = () => {
    setCurrentSlug((prevSlug) => {
      let newIndex = prevSlug - 1;
      if (newIndex < 0) {
        newIndex = slugs.length - 1;
      }
      while (slugs[newIndex]?.DropStory || (!slugs[newIndex]?.Approval && !allowUnApproved)) {
        newIndex--;
        if (newIndex < 0) {
          newIndex = slugs.length - 1;
        }
      };
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
      while (slugs[newIndex]?.DropStory || (!slugs[newIndex]?.Approval && !allowUnApproved)) {
        newIndex++;
        if (newIndex >= slugs.length) {
          newIndex = 0;
        }
      };

      setCurrentSlugName(slugs[newIndex].SlugName);
      setScriptID(slugs[newIndex].ScriptID);
      handleDoubleClick(newIndex);
      return newIndex;
    });
  }, [slugs, handleDoubleClick]);

  useEffect(() => {
    const handleButtonDown = debounce((msg) => {
      console.log(msg);
      if (msg === 1) {
        setSpeed(0);
      } else if (msg === 2) {
        setSpeed(-3);
      } else if (msg === 3) {
        setSpeed((val) => val - 1);
      } else if (msg === 4) {
        fromStart();
      } else if (msg === 5) {
        setSpeed(1);
      } else if (msg === 6) {
        setSpeed(2);
      } else if (msg === 7) {
        setSpeed(3);
      } else if (msg === 8) {
        setSpeed(4);
      } else if (msg === 9) {
        setSpeed((val) => val + 1);
      } else if (msg === 10) {
        onclickSlug(slugs[4], 4);
        handleDoubleClick(4);
      } else if (msg === 11) {
        onclickSlug(slugs[9], 9);
        handleDoubleClick(9);
      } else if (msg === 12) {
        onclickSlug(slugs[14], 14);
        handleDoubleClick(14);
      } else if (msg === 13) {
        onclickSlug(slugs[currentStoryNumber + 4], currentStoryNumber + 4);
        handleDoubleClick(currentStoryNumber + 4);
      } else if (msg === 14) {
        previous();
      } else if (msg === 15) {
        next();
      }
    }, 300); // Debounce with 300ms delay

    const handleJogdir = debounce((msg) => {
      console.log(msg);
      if (msg === 1) {
        setSpeed(1);
      } else if (msg === -1) {
        setSpeed(-1);
      }
    }, 300); // Debounce with 300ms delay

    const handleShuttle = debounce((msg) => {
      console.log(msg);
      setSpeed(msg);
    }, 300); // Debounce with 300ms delay

    socket.on("buttondown1", handleButtonDown);
    socket.on("jog-dir1", handleJogdir);
    socket.on("shuttle1", handleShuttle);

    socket.on("setCurrentStoryNumber2", (data) => {
      setCurrentStoryNumber(data);
    });

    socket.on("crossedLines2", (data) => {
      if (showReactComponent) {
        dispatch(changeCrossedLines(data));
      }
    });

    socket.on("storyLines2", (data) => {
      if (showReactComponent) {
        dispatch(changeStoryLines(data));
      }
    });

    socket.on("newPosition2", (data) => {
      if (showReactComponent) {
        setNewPosition(data);
      }
    });



    return () => {
      socket.off("buttondown1", handleButtonDown);
      socket.off("jog-dir1", handleJogdir);
      socket.off("shuttle1", handleShuttle);
      socket.off("setCurrentStoryNumber2");
      socket.off("crossedLines2");
      socket.off("storyLines2");
      socket.off("newPosition2");
      // socket.disconnect();
    };
  }, [
    next,
    previous,
    speed,
    setSpeed,
    fromStart,
    handleDoubleClick,
    slugs,
    onclickSlug,
  ]);

  useEffect(() => {
    setCurrentSlug(currentStoryNumber - 1);
    if (slugs.length > 0) {
      setScriptID(slugs[currentStoryNumber - 1]?.ScriptID);
      setCurrentSlugName(slugs[currentStoryNumber - 1]?.SlugName);
    }
  }, [currentStoryNumber, slugs]);

  useEffect(() => {
    if (stopAfterStoryChange) {
      setSpeed(0);
    }

  }, [currentStoryNumber]);


  useEffect(() => {
    if (slugs[currentStoryNumber - 1]?.DropStory){
      return;
    }
    const updatedStories = [...usedStory, slugs[currentStoryNumber - 1]?.ScriptID];
    const uniqueStories = [...new Set(updatedStories.filter((item) => item !== null))];
    setUsedStory(uniqueStories);
    return () => {
      setUsedStory([]);
    }
  }, [currentStoryNumber]);

  function replaceCRLFInArray(inputArray) {
    // Ensure inputArray is an array of strings
    if (!Array.isArray(inputArray)) {
      throw new Error("Input is not an array");
    }

    // Map over the array and replace CRLF characters in each string
    return inputArray.map((inputString) => {
      // Ensure each element is a string
      if (typeof inputString !== "string") {
        throw new Error("Array element is not a string");
      }

      // Replace all occurrences of \r, \n, or \r\n with an empty string
      return inputString.replace(/(\r\n|\n|\r)/g, "CRLF");
    });
  }
  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setStartPosition(${startPosition})`,
    });
  }, [startPosition]);

  useEffect(() => {
    const aa= JSON.stringify(
      replaceCRLFInArray(allContent)
    )
      .replaceAll('"', '\\"')
      .replaceAll(")", "closesmallbracket");
      const bb = aa.replace(/ /g, 'space1');
    endpoint({
      action: "endpoint",
      command: `call 1-97 setAllContent1(${bb})`,
    });
  }, [allContent]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setSpeed(${speed})`,
    });
  }, [speed]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setFontSize(${fontSize})`,
    });
  }, [fontSize]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setShowClock(${showClock})`,
    });
  }, [showClock]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setNewsReaderText('${newsReaderText}')`,
    });
  }, [newsReaderText]);

  const sendtoCasparafterDoubleClick = (doubleClickedPosition) => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setDoubleClickedPosition(${doubleClickedPosition})`,
    });

    endpoint({
      action: "endpoint",
      command: `call 1-97 setCurrentStoryNumber(${doubleClickedPosition + 1})`,
    });
    endpoint({
      action: "endpoint",
      command: `call 1-97 setLoggedPositions1()`,
    });
  }

  useEffect(() => {
    // endpoint({
    //   action: "endpoint",
    //   command: `call 1-97 setDoubleClickedPosition(${doubleClickedPosition})`,
    // });

    // endpoint({
    //   action: "endpoint",
    //   command: `call 1-97 setCurrentStoryNumber(${doubleClickedPosition + 1})`,
    // });
    // endpoint({
    //   action: "endpoint",
    //   command: `call 1-97 setLoggedPositions1()`,
    // });
    sendtoCasparafterDoubleClick(doubleClickedPosition);
  }, [doubleClickedPosition]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setSlugs(${JSON.stringify(
        slugs.map(item => ({ ScriptID: item.ScriptID, SlugName: item.SlugName }))
      )})`,
    });
  }, [slugs, doubleClickedPosition]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-97 setSelectedRunOrderTitle('${selectedRunOrderTitle}')`,
    });
  }, [selectedRunOrderTitle]);

  // const onTabChange = () => {

  // }

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        <div>

          <div>
            {newdatabase &&
              <div>
                <label htmlFor="date-selector">Select a date: </label>
                <input
                  id="date-selector"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
            }
          </div>
          <div>
            RO
            <select
              value={selectedRunOrderTitle}
              onChange={handleSelectionChange}
            >
              <option value="" disabled>
                Select a Run Order
              </option>
              {runOrderTitles?.map((runOrderTitle, i) => (
                <option key={i} value={runOrderTitle.title}>
                  {runOrderTitle.title}
                </option>
              ))}
            </select>
            {slugs?.length} Slugs <button onClick={fetchNewsId}>Refresh RO</button>
            <span title="Socket Server Status"> {serverAlive ? '🟢' : '🔴'}</span>

          </div>
          <div
            style={{
              minWidth: 348,
              maxWidth: 348,
              maxHeight: newdatabase ? 725 : 748,
              minHeight: newdatabase ? 725 : 748,
              overflow: "scroll",
            }}
          >
            {slugs?.map((val, i) => (
              <div
                key={i}
                onClick={() => {
                  onclickSlug(val, i);
                }}
                onDoubleClick={() => handleDoubleClick(i)}
                style={{
                  backgroundColor:
                    currentSlug === i
                      ? "green"
                      : val.DropStory
                        ? "#FF999C"
                        : !val.Approval
                          ? "red"
                          : "#E7DBD8",
                  margin: 10,
                }}
              >
                {/* <span style={{}}>{val.DropStory?'❌':'✅'}</span><span style={{ backgroundColor:'black',color:'white'}}>{!val.Approval?'👎':'👍'}</span> */}
                <span title={val.ScriptID} style={{ fontSize: 30, }}>{i + 1}</span>{usedStory.includes(val.ScriptID) ? '✅' : ' '}
                <label
                  title={
                    val.DropStory
                      ? "Story Dropped"
                      : !val.Approval
                        ? "Story UnApproved"
                        : ""
                  }
                  style={{ cursor: "pointer" }}
                >
                  {val.SlugName}{" "}
                </label>{" "}
                <br />
              </div>
            ))}
          </div>
          <button onClick={() => { setUsedStory([]) }}>Reset used story status</button>
          <label>
            {" "}
            <input
              checked={sendUsedStory}
              type="checkbox"
              onChange={() => setSendUsedStory((val) => {
                setUsedStory([]);
                return !val
              })}
            />{" "}
            <span>Send Used Story</span>
          </label>
        </div>

        {/* second column */}
        <div>
          <div
            style={{
              border: "1px solid red",
              marginBottom: 10,
              minWidth: scrollWidth,
              maxWidth: scrollWidth,
            }}
          >
            <Casparcg
              slugs={slugs}
              allContent={allContent}
              setShowReactComponent={setShowReactComponent}
              showReactComponent={showReactComponent}
              startPosition={startPosition}
              fontSize={fontSize}
              doubleClickedPosition={doubleClickedPosition}
              newPosition={newPosition}
              currentStoryNumber={currentStoryNumber}
              selectedRunOrderTitle={selectedRunOrderTitle}
            />
          </div>
          <div style={{ border: "1px solid red", marginBottom: 10 }}>
            <span>Quick Methods: </span>
            <button
              onClick={() => {
                fromStart();
              }}
            >
              From Start
            </button>
            <button onClick={previous}>Previous</button>
            <button onClick={next}>Next</button>
            <button
              onClick={() => {
                const lastIndex = slugs.length - 1;
                setCurrentSlug(lastIndex);
                handleDoubleClick(lastIndex);
                setCurrentSlugName(slugs[lastIndex].SlugName);
                setScriptID(slugs[lastIndex].ScriptID);
              }}
            >
              Go to Last
            </button>
            <label>
              {" "}
              <input
                checked={stopAfterStoryChange}
                type="checkbox"
                onChange={() => setStopAfterStoryChange((val) => !val)}
              />{" "}
              <span>Stop After Story</span>
            </label>

            <label>
              {" "}
              <input
                checked={allowUnApproved}
                type="checkbox"
                onChange={() => setAllowUnApproved((val) => !val)}
              />{" "}
              <span>Allow UnApproved</span>
            </label>


          </div>
          <div style={{ border: "1px solid red", marginBottom: 10 }}>
            <div>
              <span>News Reader Messages:</span>
              <button onClick={() => setNewsReaderText("Go Fast...")}>
                Go fast
              </button>
              <button onClick={() => setNewsReaderText("Wait...")}>Wait</button>
              <button onClick={() => setNewsReaderText(".")}>Clear</button>
              <button onClick={() => setShowClock((val) => !val)}>
                {showClock ? "Hide Clock" : "Show Clock"}
              </button>

              <button onClick={() => setNewsReaderText("Go Slow...")}>
                Go Slow
              </button>
              <button onClick={() => setNewsReaderText("Continue...")}>
                Continue...
              </button>
              <button onClick={() => setNewsReaderText("Stop...")}>Stop</button>
              {/* {scriptID && 'scriptID-' + scriptID} */}
            </div>
          </div>
          <div
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.5}px`,
              // fontWeight: "bolder",
              width: scrollWidth,
              minHeight: 600,
              maxHeight: 600,
              position: "absolute",
              top: startPosition + 28,
              overflow: "scroll",
              padding: '0 25px',
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
            }}
          >
            {slugs && slugs[currentSlug] && (
              <div
                style={{
                  backgroundColor: "blue",
                  color: "yellow",
                  width: 702,
                }}
              >
                {currentSlug + 1} {currentSlugName}
                {isVideoPresent(slugs[currentSlug]) ? " - Visual" : " -No Visual"}
              </div>
            )}

            <div style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.5}px`,
              width: 702.22,
            }}>
              {slugs && slugs[currentSlug]?.Script}
            </div>


          </div>
          <div style={{ fontSize: 16, fontWeight: "normal", position: 'absolute', top: 770, }}>
            <TTS content={slugs ? slugs[currentSlug]?.Script : ''} />
          </div>
        </div>

        {/* Third column */}
        <div>
          <div>
            {(showReactComponent) &&
              <div>
                <div style={{ maxWidth: scrollWidth, minWidth: scrollWidth, maxHeight: scrollHeight, minHeight: scrollHeight, border: '1px solid black' }}>
                  <SrollView allContent={allContent} newPosition={newPosition} fontSize={fontSize} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
                </div>
              </div>
            }
            {!showReactComponent &&(
              <Scroll
                scrollWidth={scrollWidth}
                scrollHeight={scrollHeight}
                fontSize={fontSize}
                setCurrentSlug={setCurrentSlug}
                newPosition={newPosition}
                setNewPosition={setNewPosition}
                doubleClickedPosition={doubleClickedPosition}
                textRef={textRef}
                startPosition={startPosition}
                allContent={allContent}
                showClock={showClock}
                loggedPositions={loggedPositions}
                setLoggedPositions={setLoggedPositions}
                currentStoryNumber={currentStoryNumber}
                setCurrentStoryNumber={setCurrentStoryNumber}
                speed={speed}
                selectedRunOrderTitle={selectedRunOrderTitle}
                slugs={slugs}
                newsReaderText={newsReaderText}
              />

            )}
            {!showReactComponent && showNewWindow && (
              <NewWindow
                onClose={handleCloseNewWindow}
                newWindowRef={newWindowRef}
                scrollWidth={scrollWidth}
                scrollHeight={scrollHeight}
              >
                {/* <Scroll
                  scrollWidth={scrollWidth}
                  scrollHeight={scrollHeight}
                  fontSize={fontSize}
                  setCurrentSlug={setCurrentSlug}
                  newPosition={newPosition}
                  setNewPosition={setNewPosition}
                  doubleClickedPosition={doubleClickedPosition}
                  textRef={textRef}
                  startPosition={startPosition}
                  allContent={allContent}
                  showClock={showClock}
                  loggedPositions={loggedPositions}
                  setLoggedPositions={setLoggedPositions}
                  currentStoryNumber={currentStoryNumber}
                  setCurrentStoryNumber={setCurrentStoryNumber}
                  speed={speed}
                  selectedRunOrderTitle={selectedRunOrderTitle}
                  slugs={slugs}
                  newsReaderText={newsReaderText}
                /> */}
                  <SrollView allContent={allContent} newPosition={newPosition} fontSize={fontSize} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
              </NewWindow>
            )}

            {!showReactComponent && showNewWindow2 && (
              <NewWindow
                onClose={handleCloseNewWindow2}
                newWindowRef={newWindowRef2}
                scrollWidth={scrollWidth}
                scrollHeight={scrollHeight}
              >
                {/* <Scroll
                  scrollWidth={scrollWidth}
                  scrollHeight={scrollHeight}
                  fontSize={fontSize}
                  setCurrentSlug={setCurrentSlug}
                  newPosition={newPosition}
                  setNewPosition={setNewPosition}
                  doubleClickedPosition={doubleClickedPosition}
                  textRef={textRef}
                  startPosition={startPosition}
                  allContent={allContent}
                  showClock={showClock}
                  loggedPositions={loggedPositions}
                  setLoggedPositions={setLoggedPositions}
                  currentStoryNumber={currentStoryNumber}
                  setCurrentStoryNumber={setCurrentStoryNumber}
                  speed={speed}
                  selectedRunOrderTitle={selectedRunOrderTitle}
                  slugs={slugs}
                  newsReaderText={newsReaderText}
                /> */}
                  <SrollView allContent={allContent} newPosition={newPosition} fontSize={fontSize} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />

              </NewWindow>
            )}
          </div>

          <div
            onContextMenu={(e) => {
              e.preventDefault();
              if (speed === 0) {
                setSpeed(tempSpeed);
              } else {
                setTempSpeed(speed);
                setSpeed(0);
              }
            }}
            style={{
              textAlign: "center",
              minWidth: scrollWidth,
              minHeight: 305,
              maxHeight: 305,
              overflow: "scroll",
              position: "absolute",
              top: 475,
            }}
          >
            <div>

              <button title='Decrease speed by 1' onClick={() => setSpeed((val) => val - 1)}>--1</button>
              <button onClick={() => setSpeed(-7)}>-7</button>
              <button onClick={() => setSpeed(-6)}>-6</button>
              <button onClick={() => setSpeed(-5)}> -5</button>
              <button onClick={() => setSpeed(-4)}> -4</button>
              <button onClick={() => setSpeed(-3)}> -3</button>
              <button onClick={() => setSpeed(-2)}> -2</button>
              <button onClick={() => setSpeed(-1)}> -1</button>
              <button
                onClick={() => {
                  if (speed === 0) {
                    setSpeed(tempSpeed);
                  } else {
                    setTempSpeed(speed);
                    setSpeed(0);
                  }
                }}
              >
                {" "}
                {speed ? "Pause" : "Resume"}
              </button>
              <button onClick={() => setSpeed(1)}> 1</button>
              <button onClick={() => setSpeed(2)}> 2</button>
              <button onClick={() => setSpeed(3)}> 3</button>
              <button onClick={() => setSpeed(4)}> 4</button>
              <button onClick={() => setSpeed(5)}> 5</button>
              <button onClick={() => setSpeed(6)}>6</button>
              <button onClick={() => setSpeed(7)}>7</button>
              <button title='Increase speed by 1' onClick={() => setSpeed((val) => parseInt(val) + 1)}>
                ++1
              </button>

            </div>
            <div>
              Speed: {speed}
              <input
                type="range"
                min={-20}
                max={20}
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                style={{ width: "60%" }}
              />
            </div>
            <div style={{ textAlign: "left" }}>
              {/* {'keyPressed' + keyPressed}  */}

              Right Click to Stop and Play
            </div>
            <Timer
              callback={timerFunction}
              interval={5000}
              stopOnNext={stopOnNext}
              setStopOnNext={setStopOnNext}
            />
            <h3>
              Last Update:{" "}
              {latestDate?.toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </h3>

            {!showReactComponent && (
              <div>
                For HDMI or VGA output <button
                  onClick={() => {
                    if (showNewWindow) {
                      newWindowRef.current.close();
                    }
                    { textRef && textRef.current &&  setNewPosition(textRef.current.offsetTop);}
                    setShowNewWindow(!showNewWindow);
                  }}
                >
                  {showNewWindow ? "Close New Window" : "Open New Window"}
                </button>

                <button
                  onClick={() => {
                    if (showNewWindow2) {
                      newWindowRef2.current.close();
                    }
                   { textRef && textRef.current &&  setNewPosition(textRef.current.offsetTop);}
                    setShowNewWindow2(!showNewWindow2);
                  }}
                >
                  {showNewWindow2 ? "Close New Window2" : "Open New Window2"}
                </button>
              </div>
            )}
            <button onClick={() => setShowSettings(val => !val)}>{showSettings ? 'Hide Setting' : 'Show Setting'}</button>
            <div style={{ display: showSettings ? '' : 'none' }}>
              <div>
                Font Size:
                <input
                  type="number"
                  value={fontSize}
                  style={{ width: 40 }}
                  onChange={(e) => setFontSize(e.target.value)}
                />
                Start Position:
                <input
                  type="number"
                  value={startPosition}
                  style={{ width: 40 }}
                  onChange={(e) => {
                    setStartPosition(e.target.value);
                  }}
                />

                <div style={{ display: 'flex', border: '1px solid red' }}>
                  <div>
                    DB_HOST:
                    <input
                      type="text"
                      value={DB_HOST}
                      style={{ width: 100 }}
                      onChange={(e) => {
                        setDB_HOST(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    DB_NAME:
                    <input
                      type="text"
                      value={DB_NAME}
                      style={{ width: 100 }}
                      onChange={(e) => {
                        setDB_NAME(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    CASPAR_HOST:
                    <input
                      type="text"
                      value={CASPAR_HOST}
                      style={{ width: 100 }}
                      onChange={(e) => {
                        setCASPAR_HOST(e.target.value);
                      }}
                    />
                    <button onClick={changeDB_NAME}>Set</button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    height: "100%",
                  }}
                >


                </div>

              </div>
            </div>
          {/* {usedStory.map((val, i) => {
              return <div key={i}>{val}</div>
            })}  */}

          </div>

        </div>
      </div>
    </div>
  );
}
