"use client";
import { useDispatch, useSelector } from 'react-redux';

import { useState, useEffect, useRef, useCallback, use } from "react";
import NewWindow from "./components/NewWindow";
import Scroll from "./components/Scroll";
import io from "socket.io-client";

// import socket from "./components/socket"; // assumes shared instance


import Casparcg from "./Casparcg";
import Timer from "./components/Timer";
import TTS from './components/TTS.jsx'
import ScrollView from './components/ScrollView';
import { changenewdatabase } from './store/store'; // Adjust the path as needed
import mammoth from 'mammoth';
import 'react-tabs/style/react-tabs.css';

import { UseSocketControls } from "./components/UseSocketControls";
// import { UseSocketControls } from "./components/UseSocketControlsJaipur";



// const scrollWidth = 600;
const scrollHeight = 440;
const scrollWidth = 782;//scrollHeight * 16 / 9=782.22;
var socket;

const dummyScriptid = 200502071223160;
const fixdata = {
  "ScriptID": "202502071223160",
  "id": 636,
  "bulletinname": "simnews1",
  "bulletinlock": 0,
  "bulletindate": "2025-02-06T18:30:00.000Z",
  "bulletintype": "",
  "rowid": "202502071223160",
  "slno": 1,
  "SlugName": "No Slug Name",
  "Script": "No Script",
  "scriptmodifiedtime": "2025-02-07T06:55:51.000Z",
  "createdtime": "2025-02-07T06:53:16.000Z",
  "createdby": "binoy",
  "currentuser": "rajeev",
  "LastModifiedTime": "2025-02-07T11:46:46.000Z",
  "lastmodifiedby": null,
  "Lockscript": 0,
  "lockedby": null,
  "WordsCount": 1.31,
  "EditCode": "0",
  "autosavestatus": 0,
  "OneLinerText": null,
  "onelinermodifiedtime": null,
  "importedscriptid": null,
  "importedbulletinname": null,
  "media1": null,
  "media2": null,
  "media3": null,
  "media4": null,
  "media5": null,
  "media1duration": "00:00:00",
  "media2duration": "00:00:00",
  "media3duration": "00:00:00",
  "media4duration": "00:00:00",
  "media5duration": "00:00:00",
  "mediamodifiedtime": null,
  "mediamodifiedby": null,
  "source": null,
  "dropstory": 0,
  "archivestatus": 0,
  "graphicsid": null,
  "reporter1": null,
  "reporter2": null,
  "location": null,
  "repeated": 0,
  "approved": 1,
  "deleted": 0,
  "voiceover": 0,
  "RunOrder": 1,
  "CreatedTime": "2025-02-07T06:53:16.000Z",
  "ScriptLastModifiedTime": "2025-02-07T06:55:51.000Z",
  "Approval": 1,
  "MediaInsert": null,
  "DropStory": 0
};

var socket;


export default function Home() {
  const [useDB, setUseDB] = useState(true);
  const [singleScript, setSingleScript] = useState(false);
  const [file, setFile] = useState(null);


  const [ZXZX, setZXZX] = useState(false);


  const dispatch = useDispatch();
  const storyLines = useSelector((state) => state.storyLinesReducer.storyLines);
  const crossedLines = useSelector((state) => state.crossedLinesReducer.crossedLines);
  const newdatabase = useSelector((state) => state.newdatabaseReducer.newdatabase);

  const [startPosition, setStartPosition] = useState(150);
  const [speed, setSpeed] = useState(0);
  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState("0600 Hrs");
  const [slugs, setSlugs] = useState([]);
  const [currentSlug, setCurrentSlug] = useState(0);
  const [currentSlugName, setCurrentSlugName] = useState("");
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
  const [stopOnNext, setStopOnNext] = useState(false);
  const [latestDate, setLatestDate] = useState(null);
  const [allowUnApproved, setAllowUnApproved] = useState(false);
  const [DB_NAME, setDB_NAME] = useState('nrcsnew');
  const [DB_HOST, setDB_HOST] = useState('localhost');
  const [CASPAR_HOST, setCASPAR_HOST] = useState('127.0.0.1');
  const [showSettings, setShowSettings] = useState(false);

  const [keyPressed, setKeyPressed] = useState('');

  const newWindowRef = useRef(null);
  const newWindowRef2 = useRef(null);
  const textRef = useRef(null);

  const [serverAlive, setServerAlive] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [usedStory, setUsedStory] = useState([]);

  const [sendUsedStory, setSendUsedStory] = useState(false);
  const [prompterId, setPrompterId] = useState(1);


  const updateCurrentStory = useCallback((curstory, curbulletin, ScriptID, usedStory, selectedDate, prompterId) => {
    if (!curbulletin) return;
    if (!ScriptID) return;
    console.log('Prompter ID being sent:', prompterId);

    fetch('/api/currentStory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curstory, curbulletin, ScriptID: sendUsedStory ? ((usedStory.length === 0) ? 123456478 : ScriptID) : 123456789, usedStory: sendUsedStory ? usedStory : [], selectedDate, prompterId }),

    })
      .then(response => response.json())
      .then(data => {
        // console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [sendUsedStory, prompterId]);

  useEffect(() => {
    if (!slugs) return;
    if (!useDB) return;
    updateCurrentStory(currentStoryNumber, selectedRunOrderTitle, slugs[currentStoryNumber - 1]?.ScriptID, usedStory, selectedDate, prompterId);
  }, [useDB, currentStoryNumber, selectedRunOrderTitle, updateCurrentStory, slugs, usedStory, selectedDate, prompterId]);


  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date)

    setSpeed(0);
    setDoubleClickedPosition(0);
  };

  useEffect(() => {
    readFile(file);
  }, [singleScript])


  useEffect(() => {
    socket = io();
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED! from main page", socket.id);
      setServerAlive(true);

    });
    socket.on("newdatabase", (data) => {
      dispatch(changenewdatabase(data));
    });

    socket.on('connect_error', (error) => {
      console.log(error)
      setServerAlive(false);
      // connectbutton.current.style.backgroundColor = "red";
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setServerAlive(false);
      // connectbutton.current.style.backgroundColor = "red";
    });

    return () => {
      // socket.off("connect");
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
  const handleTextareaKeyDown = (event) => {
    if (event.code === 'Space') {
      event.stopPropagation(); // Prevent spacebar from bubbling to document
    }
  };

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
    if (!useDB) {
      return
    }

    try {
      const res = await fetch(
        `/api/ShowRunOrder?NewsId=${selectedRunOrderTitle}&date=${selectedDate}`
      );
      const data = await res.json();

      const newSlugsTotal = data.data;
      if (!newSlugsTotal) return
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
          (data.data[currentStoryNumber - 1]?.DropStory === 1) || (data.data[currentStoryNumber - 1]?.DropStory === 3) ||
          (data.data[currentStoryNumber - 1]?.Approval === 0)
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

  const isVideoNndCGPresent = (slug) => {
    if (!useDB && file) return ""; // Handle single script case
    if (!slug) return "No visuals"; // Handle undefined slug

    const mediaList = [slug.media1, slug.media2, slug.media3, slug.media4, slug.media5];
    const count = mediaList.filter(item => item?.trim()).length; // Count valid media entries

    const totalCount = newdatabase ? count : (slug?.Media ? 1 : 0);
    var aa;


    if (totalCount === 0) {
      aa = ", (No Visual)";
    }
    else if (totalCount === 1) {
      aa = `, (1 Visual)`;
    }
    else {
      aa = `, (${totalCount} Visuals)`;
    }
    return `${aa} (${(slug.graphicsid) ? slug.graphicsid : 'No CG'})`;
  };


  const fetchAllContent = (slicedSlugs, startNumber) => {
    if (!Array.isArray(slicedSlugs) || slicedSlugs.length === 0) {
      return;
    }

    const data1 = new Array(slicedSlugs.length * 3);
    try {
      slicedSlugs.forEach((slug, i) => {

        if ((slug.DropStory === 0 || slug.DropStory === 2) && (slug?.Approval || allowUnApproved)) {
          data1[i * 3] = `${startNumber + i + 1} ${slug?.SlugName}${isVideoNndCGPresent(slug)
            }`;
          // data1[i * 3 + 1] = `${slug.Script}`;
          data1[i * 3 + 1] = slug.Script ? `${slug.Script?.trim().split('$$$$')[0]}` : '';
          data1[i * 3 + 2] = `--------------`;
        } else {
          data1[i * 3] = `${startNumber + i + 1} ${!(slug?.DropStory === 0 || slug?.DropStory === 2) ? "Story Dropped" : "Story UnApproved"}`;

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
    }
  };

  const handleDoubleClick = (i) => {
    if (i === 0) {
      setUsedStory(val => [...val, slugs[0]?.ScriptID]);
    }
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
    }
  };
  const fromStart = () => {
    setCurrentSlug(0);
    handleDoubleClick(0);
    if (slugs.length > 0) {
      setCurrentSlugName(slugs[0].SlugName);
    }
  };

  const previous = () => {
    setCurrentSlug((prevSlug) => {
      let newIndex = prevSlug - 1;
      if (newIndex < 0) {
        newIndex = slugs.length - 1;
      }
      while (((slugs[newIndex]?.DropStory === 1) || (slugs[newIndex]?.DropStory) === 3) || (!slugs[newIndex]?.Approval && !allowUnApproved)) {
        newIndex--;
        if (newIndex < 0) {
          newIndex = slugs.length - 1;
        }
      };
      handleDoubleClick(newIndex);
      setCurrentSlugName(slugs[newIndex].SlugName);
      return newIndex;
    });
  };

  const next = useCallback(() => {
    setCurrentSlug((prevSlug) => {
      let newIndex = prevSlug + 1;
      if (newIndex >= slugs.length) {
        newIndex = 0;
      }
      while (((slugs[newIndex]?.DropStory === 1) || (slugs[newIndex]?.DropStory) === 3) || (!slugs[newIndex]?.Approval && !allowUnApproved)) {
        newIndex++;
        if (newIndex >= slugs.length) {
          newIndex = 0;
        }
      };

      setCurrentSlugName(slugs[newIndex].SlugName);
      handleDoubleClick(newIndex);
      return newIndex;
    });
  }, [slugs, handleDoubleClick]);

  // useEffect(() => {
  //   const handleButtonDown = debounce((msg) => {
  //     console.log(msg);
  //     if (msg === 1) {
  //       setSpeed(0);
  //     } else if (msg === 2) {
  //       setSpeed(-3);
  //     } else if (msg === 3) {
  //       setSpeed((val) => val - 1);
  //     } else if (msg === 4) {
  //       fromStart();
  //     } else if (msg === 5) {
  //       setSpeed(1);
  //     } else if (msg === 6) {
  //       setSpeed(2);
  //     } else if (msg === 7) {
  //       setSpeed(3);
  //     } else if (msg === 8) {
  //       setSpeed(4);
  //     } else if (msg === 9) {
  //       setSpeed((val) => val + 1);
  //     } else if (msg === 10) {
  //       onclickSlug(slugs[4], 4);
  //       handleDoubleClick(4);
  //     } else if (msg === 11) {
  //       onclickSlug(slugs[9], 9);
  //       handleDoubleClick(9);
  //     } else if (msg === 12) {
  //       onclickSlug(slugs[14], 14);
  //       handleDoubleClick(14);
  //     } else if (msg === 13) {
  //       onclickSlug(slugs[currentStoryNumber + 4], currentStoryNumber + 4);
  //       handleDoubleClick(currentStoryNumber + 4);
  //     } else if (msg === 14) {
  //       previous();
  //     } else if (msg === 15) {
  //       next();
  //     }
  //   }, 300); // Debounce with 300ms delay

  //   const handleJogdir = debounce((msg) => {
  //     console.log(msg);
  //     if (msg === 1) {
  //       setSpeed(1);
  //     } else if (msg === -1) {
  //       setSpeed(-1);
  //     }
  //   }, 300); // Debounce with 300ms delay

  //   const handleShuttle = debounce((msg) => {
  //     console.log(msg);
  //     setSpeed(msg);
  //   }, 300); // Debounce with 300ms delay

  //   socket.on("buttondown1", handleButtonDown);
  //   socket.on("jog-dir1", handleJogdir);
  //   socket.on("shuttle1", handleShuttle);

  //   return () => {
  //     socket.off("buttondown1", handleButtonDown);
  //     socket.off("jog-dir1", handleJogdir);
  //     socket.off("shuttle1", handleShuttle);
  //     // socket.disconnect();
  //   };
  // }, [next, previous, speed, setSpeed, fromStart, handleDoubleClick, slugs, onclickSlug,]);



  useEffect(() => {
    setCurrentSlug(currentStoryNumber - 1);
    if (!slugs) return;
    setCurrentSlugName(slugs[currentStoryNumber - 1]?.SlugName);
  }, [currentStoryNumber, slugs]);

  useEffect(() => {
    if (stopAfterStoryChange) {
      setSpeed(0);
    }

  }, [currentStoryNumber]);


  useEffect(() => {
    if (slugs[currentStoryNumber - 1]?.DropStory === 1 || slugs[currentStoryNumber - 1]?.DropStory === 3) {
      return;
    }
    const updatedStories = [...usedStory, slugs[currentStoryNumber - 1]?.ScriptID];
    const uniqueStories = [...new Set(updatedStories.filter((item) => item !== null))];
    setUsedStory(uniqueStories);
  }, [currentStoryNumber]);

  useEffect(() => {
    socket.emit('allContent', allContent);
  }, [allContent])

  useEffect(() => {
    socket.emit('speed', speed);
  }, [speed]);

  useEffect(() => {
    socket.emit('setFontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    socket.emit('setStartPosition', startPosition);
  }, [startPosition]);

  useEffect(() => {
    socket.emit('setShowClock', showClock);
  }, [showClock]);

  useEffect(() => {
    socket.emit('setNewsReaderText', newsReaderText);
  }, [newsReaderText]);


  useEffect(() => {
    if (!slugs) return;
    socket.emit('setSlugs', slugs.length);
  }, [slugs]);

  const dropStoryValue = (slug) => {
    if (slug.DropStory === 0) {
      return 3;
    }
    if (slug.DropStory === 1) {
      return 2;
    }
    if (slug.DropStory === 2) {
      return 3;
    }
    if (slug.DropStory === 3) {
      return 2;
    }
  }
  const readFile = (selectedFile) => {
    if (!selectedFile) return;
    console.log(selectedFile.type === 'text/plain');
    const reader = new FileReader();
    let bb = [];

    if (selectedFile.type !== 'text/plain') {
      reader.onload = function (event) {
        const arrayBuffer = event.target.result;

        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(function (result) {
            const content = result.value; // extracted text
            const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line !== ""); // Remove empty lines
            if (singleScript) {
              bb = [{ ...fixdata, ScriptID: dummyScriptid, SlugName: selectedFile.name, Script: content }];
              setSlugs(bb);

            }
            else {
              bb = lines.map((line, index) => {
                const words = line.split(/\s+/).slice(0, 3).join(" "); // Extract first three words
                return {
                  ...fixdata,
                  ScriptID: dummyScriptid + index,
                  SlugName: words || `Slug${index + 1}`, // Fallback if line is empty
                  Script: line
                };
              });
              setSlugs(bb);

            }

          })
          .catch(function (err) {
            console.error("Error reading docx:", err);
          });
      };

      reader.readAsArrayBuffer(selectedFile);

    }
    else {
      reader.onload = (e) => {
        const content = e.target.result;
        const hasZXZX = /ZXZX/i.test(content);
        setZXZX(hasZXZX);

        if (hasZXZX) {
          const aa = content.split(/ZCZC/i);
          bb = aa.map((item, index) => {
            const [SlugName, Script] = item.split(/ZXZX/i).map(str => str.trim().replace(/\r?\n/g, ''));
            return {
              ...fixdata,
              ScriptID: dummyScriptid + index,
              Approval: SlugName.includes('(Story UnApproved)') ? 0 : 1,
              DropStory: SlugName.includes('(Story Dropped)') ? 1 : 0,
              SlugName,
              Script
            };
          });
        } else {

          const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line !== ""); // Remove empty lines
          if (singleScript) {
            bb = [{ ...fixdata, ScriptID: dummyScriptid, SlugName: selectedFile.name, Script: content }];
          }
          else {
            bb = lines.map((line, index) => {
              const words = line.split(/\s+/).slice(0, 3).join(" "); // Extract first three words
              return {
                ...fixdata,
                ScriptID: dummyScriptid + index,
                SlugName: words || `Slug${index + 1}`, // Fallback if line is empty
                Script: line
              };
            });
          }
        }
        setSlugs(bb);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);  // Save the file to state
    readFile(selectedFile);
  };

  const exportScript = () => {
    if (!slugs) return;
    let text = '';
    slugs.forEach((item) => {
      text += `${item.SlugName}${(item.DropStory === 1 || item.DropStory === 3) ? '(Story Dropped)' : ''}${!item.approved ? '(Story UnApproved)' : ''}\nZXZX\n${item.Script}\nZCZC\n`;
    });
    // Remove the last occurrence of "ZCZC\n"
    text = text.replace(/ZCZC\n$/, '');
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedDate + '_' + selectedRunOrderTitle + "_script.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }
  const saveScript = () => {
    const content = (slugs.map((slug) => slug.Script)).join('\n'); // Join array items into text
    const blob = new Blob([content], { type: 'text/plain' }); // Create a Blob
    const url = URL.createObjectURL(blob); // Create a download URL

    const link = document.createElement('a');
    link.href = url;
    link.download = 'scripts.txt'; // Download as 'scripts.txt'
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url); // Clean up the URL
  }




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
                  disabled={!useDB}
                />
              </div>
            }
          </div>

          <div>
            RO
            <select
              value={selectedRunOrderTitle}
              onChange={handleSelectionChange}
              disabled={!useDB}
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
                      : (val.DropStory === 1 || val.DropStory === 3)
                        ? "#FF999C"
                        : !val.Approval
                          ? "red"
                          : "#E7DBD8",
                  margin: 10,
                }}
              >
                {/* {val.DropStory} */}
                <input
                  title={(val.DropStory === 0 || val.DropStory === 2) ? 'Uncheck to Drop' : 'Check to Include'}
                  type="checkbox"
                  checked={val.DropStory === 0 || val.DropStory === 2}
                  onChange={(e) => {
                    // Correctly updating the array
                    const updatedSlugs = [...slugs]; // Create a copy of the array
                    updatedSlugs[i] = { ...updatedSlugs[i], DropStory: dropStoryValue(val) }; // Modify the object at index i
                    setSlugs(updatedSlugs); // Update state with the modified array
                    fetch('/api/setDropedStory', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ dropstory: dropStoryValue(val), ScriptID: val.ScriptID, bulletindate: selectedDate, bulletinname: selectedRunOrderTitle, prompterId }),
                    })
                      .then(response => response.json())
                      .then(data => {
                        console.log('Success:', data);
                      })
                      .catch(error => {
                        console.error('Error:', error);
                      });

                  }}
                />
                <span title={'ScriptID:-' + val.ScriptID} style={{ fontSize: 30, }}>{i + 1}</span>{usedStory.includes(val.ScriptID) ? '✅' : ' '}
                <label
                  title={
                    (val.DropStory === 1 || val.DropStory === 3)
                      ? "Story Dropped"
                      : !val.Approval
                        ? "Story UnApproved"
                        : ""
                  }
                  style={{ cursor: "pointer" }}
                >
                  {val.SlugName}{" "}
                </label>{" "}
                <label style={{ marginRight: 0, fontSize: 12 }}>{isVideoNndCGPresent(val)}</label>
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
            <b><span>Send Used Story</span></b>
          </label>

          <div title={useDB ? 'Data from database' : `Text file should be like this
            Slugname1
            ZXZX
            Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 Stroty1 
            ZCZC
            Slugname2
            ZXZX
            Story2 Story2 Story2 Story2 Story2 Story2 Story2 Story2 Story2 Story2 Story2 Story2 
            ZCZC
            Slugname3
            ZXZX
            Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 Story3 `}>
            <label>
              {" "}
              <input
                checked={useDB}
                type="checkbox"
                onChange={() => setUseDB((val) => {
                  setFile(null);
                  return !val
                })}
              />{" "}
              <span>Use DB</span>
              {!useDB &&
                <input
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileChange}
                />
              }
            </label>
            {!useDB && file && !ZXZX &&
              <label>
                <input
                  checked={singleScript}
                  type="checkbox"
                  onChange={() => setSingleScript((val) => {
                    return !val
                  })}
                />
                <span>Single Script</span>
              </label>
            }


          </div>
          <div><button onClick={exportScript}>Export Script</button></div>
          {/* <div>
            {JSON.stringify(textRef?.current?.getBoundingClientRect().top,)}
          </div>
          <div>
            {JSON.stringify(textRef?.current?.getBoundingClientRect().height)}
          </div> */}
          {/* {JSON.stringify(usedStory)} */}
          <div>
            Prompter ID <input style={{ width: 40 }} min={1} type="number" value={prompterId} onChange={(e) => {
              setUsedStory([]);
              setPrompterId(e.target.value);
            }} />
          </div>
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
              startPosition={startPosition}
              fontSize={fontSize}
              doubleClickedPosition={doubleClickedPosition}
              newPosition={newPosition}
              currentStoryNumber={currentStoryNumber}
              selectedRunOrderTitle={selectedRunOrderTitle}
              storyLines={storyLines}
              crossedLines={crossedLines}
              speed={speed}
              showClock={showClock}
              newsReaderText={newsReaderText}
              setSpeed={setSpeed}
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
                {isVideoNndCGPresent(slugs[currentSlug])}
              </div>
            )}

            <div style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.5}px`,
              width: 702.22,
              overflow: "hidden",
            }}>{(!useDB && file) ?
              <textarea
                onKeyDown={handleTextareaKeyDown}
                value={slugs?.[currentSlug]?.Script ?? ''}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize * 1.5}px`,
                  width: 702.22,
                  height: 510,
                  border: 'none',
                  resize: 'none',
                }}
                onChange={(e) => {
                  const updatedSlugs = [...slugs]; // Create a copy of the array
                  updatedSlugs[currentSlug] = { ...updatedSlugs[currentSlug], Script: e.target.value }; // Modify the object at index i
                  setSlugs(updatedSlugs); // Update state with the modified array
                }}
              /> : (slugs?.[currentSlug]?.Script)?.trim() ?? ''

              }
            </div>

          </div>

          <div style={{ fontSize: 16, fontWeight: "normal", position: 'absolute', top: 770, }}>
            {!useDB && <div><button onClick={saveScript}>Save Script</button></div>}

            <TTS content={slugs ? slugs[currentSlug]?.Script : ''} />
          </div>
        </div>

        {/* Third column */}
        <div>
          <div>
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
              setSpeed={setSpeed}
            />
            {showNewWindow && (
              <NewWindow
                onClose={handleCloseNewWindow}
                newWindowRef={newWindowRef}
                scrollWidth={scrollWidth}
                scrollHeight={scrollHeight}
              >

                <ScrollView allContent={allContent} newPosition={newPosition} fontSize={fontSize} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
              </NewWindow>

            )}
            {showNewWindow2 && (
              <NewWindow
                onClose={handleCloseNewWindow2}
                newWindowRef={newWindowRef2}
                scrollWidth={scrollWidth}
                scrollHeight={scrollHeight}
              >
                <ScrollView allContent={allContent} newPosition={newPosition} fontSize={fontSize} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} scrollWidth={scrollWidth} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} />
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
              <button onClick={() => setSpeed(1)}> Start with Speed 1</button>
              <button onClick={() => setSpeed(2)}> 2</button>
              <button onClick={() => setSpeed(3)}> 3</button>
              <button onClick={() => setSpeed(4)}> 4</button>
              <button onClick={() => setSpeed(5)}> 5</button>
              <button onClick={() => setSpeed(6)}>6</button>
              <button onClick={() => setSpeed(7)}>7</button>
              <button title='Increase speed by 1' onClick={() => setSpeed((val) => parseInt(val) + 1)}>
                ++1
              </button>
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
              <button onClick={() => setSpeed(-1)}> -1</button>
              <button onClick={() => setSpeed(-2)}> -2</button>
              <button onClick={() => setSpeed(-3)}> -3</button>
              <button onClick={() => setSpeed(-4)}> -4</button>
              <button onClick={() => setSpeed(-5)}> -5</button>
              <button onClick={() => setSpeed(-6)}>-6</button>
              <button onClick={() => setSpeed(-7)}>-7</button>
              <button title='Decrease speed by 1' onClick={() => setSpeed((val) => val - 1)}>--1</button>

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


            <div>
              For HDMI or VGA output <button
                onClick={() => {
                  if (showNewWindow) {
                    newWindowRef.current.close();
                  }
                  { textRef && textRef.current && setNewPosition(textRef.current.offsetTop); }
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
                  { textRef && textRef.current && setNewPosition(textRef.current.offsetTop); }
                  setShowNewWindow2(!showNewWindow2);
                }}
              >
                {showNewWindow2 ? "Close New Window2" : "Open New Window2"}
              </button>
              <button onClick={() => {
                window.open('/CasparcgOutput2', '', `width=${scrollWidth},height=${scrollHeight + 40}`);
                setTimeout(() => {
                  socket.emit('newPosition', newPosition);
                  socket.emit('setCurrentStoryNumber', currentStoryNumber);
                  socket.emit('storyLines', storyLines);
                  socket.emit('crossedLines', crossedLines);
                  socket.emit('allContent', allContent);
                  socket.emit('setSlugs', slugs.length);

                  socket.emit('setFontSize', fontSize);
                  socket.emit('setStartPosition', startPosition);

                  socket.emit('setShowClock', showClock);
                  socket.emit('setNewsReaderText', newsReaderText);

                }, 3000);
              }}>Test</button>
            </div>

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

                  <UseSocketControls speed={speed} setSpeed={setSpeed} tempSpeed={tempSpeed} setTempSpeed={setTempSpeed} fromStart={fromStart} handleDoubleClick={handleDoubleClick} slugs={slugs} currentStoryNumber={currentStoryNumber} onclickSlug={onclickSlug} previous={previous} next={next} />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
