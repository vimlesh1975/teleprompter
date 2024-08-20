"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import NewWindow from "./components/NewWindow";
import Scroll from "./components/Scroll";
import io from "socket.io-client";
import debounce from "lodash.debounce"; // Importing debounce from lodash

import Casparcg from "./Casparcg";
import Timer from "./components/Timer";
const scrollWidth = 600;
const scrollHeight = 522;

const socket = io();
socket.on("connect", () => {
  console.log("SOCKET CONNECTED! from main page", socket.id);
});

export default function Home() {
  const [startPosition, setStartPosition] = useState(150);
  const [speed, setSpeed] = useState(0);
  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState("");
  const [slugs, setSlugs] = useState([]);
  const [scriptID, setScriptID] = useState("");
  const [currentSlug, setCurrentSlug] = useState(0);
  const [currentSlugName, setCurrentSlugName] = useState("");
  const [content, setContent] = useState("");
  const [allContent, setAllContent] = useState([]);
  const [newsReaderText, setNewsReaderText] = useState("Continue...");
  const [showClock, setShowClock] = useState(true);
  const [newPosition, setNewPosition] = useState(startPosition);
  const [tempSpeed, setTempSpeed] = useState(0);
  const [loggedPositions, setLoggedPositions] = useState(new Set());
  const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
  const [showNewWindow, setShowNewWindow] = useState(false);
  const [doubleClickedPosition, setDoubleClickedPosition] = useState(0);
  const [fontSize, setFontSize] = useState(39);
  const [stopAfterStoryChange, setStopAfterStoryChange] = useState(false);
  const [showReactComponent, setShowReactComponent] = useState(false);
  const [stopOnNext, setStopOnNext] = useState(false);
  const [latestDate, setLatestDate] = useState(null);

  const newWindowRef = useRef(null);
  const textRef = useRef(null);

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

  const timerFunction = async () => {
    try {
      const res = await fetch(
        `/api/ShowRunOrder?NewsId=${selectedRunOrderTitle}`
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
        console.log(
          `'There is Update at ${newLatestDateTotal.toLocaleString()}'`
        );
        setLatestDate(newLatestDateTotal);
        setSlugs(data.data);
      } else {
        console.log(`'No Update at all'`);
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
          console.log("current story dropped or not disapproved");
          handleDoubleClick(currentStoryNumber);
        } else {
          fetchAllContent(newSlugs, doubleClickedPosition);
        }
      } else {
        console.log("No update below current story");
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
          `/api/ShowRunOrder?NewsId=${selectedRunOrderTitle}`
        );
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/script?ScriptID=${encodeURIComponent(
            scriptID
          )}&NewsId=${encodeURIComponent(selectedRunOrderTitle)}`
        );
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

  const fetchAllContent = (slicedSlugs, startNumber) => {
    if (!Array.isArray(slicedSlugs) || slicedSlugs.length === 0) {
      return;
    }

    const data1 = new Array(slicedSlugs.length * 3);
    try {
      slicedSlugs.forEach((slug, i) => {
        if (!slug?.DropStory && slug?.Approval) {
          data1[i * 3] = `${startNumber + i + 1} ${slug?.SlugName}${slug?.Media ? " - Visual" : " - No Visual"
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
      setScriptID(slugs[0].ScriptID);
    }
  };

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
        setSpeed(2);
      } else if (msg === -1) {
        setSpeed(-2);
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

    return () => {
      socket.off("buttondown1", handleButtonDown);
      socket.off("jog-dir1", handleJogdir);
      socket.off("shuttle1", handleShuttle);
      socket.off("setCurrentStoryNumber2");
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
      command: `call 1-2 setStartPosition(${startPosition})`,
    });
  }, [startPosition]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setAllContent1(${JSON.stringify(
        replaceCRLFInArray(allContent)
      )
        .replaceAll('"', '\\"')
        .replaceAll(")", "closesmallbracket")})`,
    });
  }, [allContent]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setSpeed(${speed})`,
    });
  }, [speed]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setFontSize(${fontSize})`,
    });
  }, [fontSize]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setShowClock(${showClock})`,
    });
  }, [showClock]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setNewsReaderText('${newsReaderText}')`,
    });
  }, [newsReaderText]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setDoubleClickedPosition(${doubleClickedPosition})`,
    });
    endpoint({
      action: "endpoint",
      command: `call 1-2 setNewPosition(${startPosition})`,
    });
    endpoint({
      action: "endpoint",
      command: `call 1-2 setCurrentStoryNumber(${doubleClickedPosition + 1})`,
    });
    endpoint({
      action: "endpoint",
      command: `call 1-2 setLoggedPositions1()`,
    });
  }, [doubleClickedPosition]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setSlugs(${JSON.stringify(
        slugs.map((item) => item.SlugName)
      )})`,
    });
  }, [slugs, doubleClickedPosition]);

  useEffect(() => {
    endpoint({
      action: "endpoint",
      command: `call 1-2 setSelectedRunOrderTitle('${selectedRunOrderTitle}')`,
    });
  }, [selectedRunOrderTitle]);

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        <div>
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
            {slugs?.length} Slugs <button onClick={fetchNewsId}>Refresh</button>
          </div>
          <div
            style={{
              minWidth: 348,
              maxWidth: 348,
              maxHeight: 700,
              minHeight: 700,
              overflow: "auto",
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
                {i + 1}{" "}
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
        </div>
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
            />
          </div>
          <div style={{ border: "1px solid red", marginBottom: 10 }}>
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
              <span>Stop After Story Change</span>
            </label>
          </div>
          <div style={{ border: "1px solid red", marginBottom: 10 }}>
            <div>
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
              fontWeight: "bolder",
              width: scrollWidth,
              minHeight: scrollHeight,
              position: "absolute",
              top: startPosition + 28,
            }}
          >
            {slugs && slugs[currentSlug] && (
              <div
                style={{
                  backgroundColor: "blue",
                  color: "yellow",
                  padding: "0 25px",
                }}
              >
                {currentSlug + 1} {currentSlugName}
                {slugs[currentSlug]?.Media ? " - Visual" : " -No Visual"}
              </div>
            )}
            <textarea
              value={content}
              style={{
                fontSize: `${fontSize}px`,
                width: scrollWidth,
                minHeight: scrollHeight - 80,
                maxHeight: scrollHeight - 80,
                lineHeight: `${fontSize * 1.3}px`,
              }}
              disabled
            />
          </div>
        </div>
        <div>
          <div>
            {!showReactComponent && !showNewWindow && (
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
              border: "1px solid red",
              minWidth: scrollWidth,
              minHeight: 190,
              position: "absolute",
              top: 535,
            }}
          >
            <div>
              <button onClick={() => setSpeed((val) => val - 1)}>-</button>
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
              <button onClick={() => setSpeed((val) => parseInt(val) + 1)}>
                +1
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

            {!showReactComponent && (
              <div>
                <button
                  onClick={() => {
                    if (showNewWindow) {
                      newWindowRef.current.close();
                    }
                    setNewPosition(textRef.current.offsetTop);
                    setShowNewWindow(!showNewWindow);
                  }}
                >
                  {showNewWindow ? "Close New Window" : "Open New Window"}
                </button>
              </div>
            )}

            <div>
              Font Size:
              <input
                type="number"
                value={fontSize}
                style={{ width: 50 }}
                onChange={(e) => setFontSize(e.target.value)}
              />
              Start Position:
              <input
                type="number"
                value={startPosition}
                style={{ width: 50 }}
                onChange={(e) => {
                  setStartPosition(e.target.value);
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "100%",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  Right Click to Stop and Play
                </div>
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
              </div>
              <Timer
                callback={timerFunction}
                interval={5000}
                stopOnNext={stopOnNext}
                setStopOnNext={setStopOnNext}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
