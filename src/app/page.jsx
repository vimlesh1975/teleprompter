'use client';

import { useState, useEffect, useRef } from 'react';
// import ScrollingText from './components/ScrollingText'
import './components/ScrollingText.css';



export default function Home() {
  const [speed, setSpeed] = useState(0)

  const [connected, setConnected] = useState(false);

  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');
  const [slugs, setSlugs] = useState([]);
  const [ScriptID, setScriptID] = useState('');
  const [currentSlug, setCurrentSlug] = useState(0);
  const [currentSlugSlugName, setCurrentSlugSlugName] = useState('');

  const [content, setContent] = useState('');
  const [allContent, setAllContent] = useState([]);



  const containerRef = useRef(null);
  const textRef = useRef(null);


  useEffect(() => {
    let animationFrameId;

    const scrollText = () => {
      if (textRef.current) {
        const currentTop = textRef.current.offsetTop;
        const newTop = currentTop - (speed / 60); // Assuming 60 frames per second
        textRef.current.style.top = `${newTop}px`;
      }
      animationFrameId = requestAnimationFrame(scrollText);
    };
    animationFrameId = requestAnimationFrame(scrollText);
    return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
  }, [speed]);


  const endpoint = async (str) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify the content type as JSON
        // You may include other headers as needed
      },
      body: JSON.stringify(str), // Convert the data to JSON format
    };
    const aa = await fetch('/api', requestOptions);
    if (str.action === 'connect' || str.action === 'disconnect') {
      setConnected(await aa.json());
    }
  };
  const handleSelectionChange = (e) => {
    setSelectedRunOrderTitle(e.target.value);
    setCurrentSlug(0)
    setCurrentSlugSlugName(slugs[0].SlugName)
    setScriptID(slugs[0].ScriptID);
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/newsid');
        setRunOrderTitles((await res.json()).data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const fetchAllContent = async (aa, startNumber) => {
    const data1 = new Array(aa.length * 2);
    const fetchPromises = aa.map((slug, i) =>
      fetch(`/api/script?ScriptID=${slug.ScriptID}`)
        .then(async (res) => {
          const dd = await res.json();
          const data = dd.data?.Script;
          data1[i * 2] = `${startNumber + i + 1} ${slug.SlugName}`;
          data1[i * 2 + 1] = `${data}`;
          console.log(data1)
        })
        .catch((error) => {
          console.error('Error fetching content:', error);
        })
    );

    await Promise.all(fetchPromises);
    setAllContent(data1.filter((item) => item !== undefined));
  };

  useEffect(() => {
    var aa;
    async function fetchData() {
      try {
        const res = await fetch(`/api/slug?param1=${selectedRunOrderTitle}`);
        aa = await (await res.json()).data
        setSlugs(aa);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData().then(() => fetchAllContent(aa, 0))//
  }, [selectedRunOrderTitle]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/script?ScriptID=${ScriptID}`);
        setContent((await res.json()).data?.Script);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [ScriptID]);

  const handleDoubleClick = (i) => {
    const aa = [...slugs];
    aa.splice(0, i);
    fetchAllContent(aa, i);
    setSpeed(0);
    if (textRef.current) {
      textRef.current.style.top = `${325}px`;
    }
  };
  return (<div>
    <div style={{ display: 'flex' }}>
      <div>
        <div>
          Run Orders:<select value={selectedRunOrderTitle} onChange={handleSelectionChange}>
            <option value="" disabled>Select a Run Order</option>
            {runOrderTitles && runOrderTitles.map((runOrderTitle, i) => (
              <option key={i} value={runOrderTitle.title}>{runOrderTitle.title}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 300, maxHeight: 700, overflow: 'auto' }}>
          {slugs?.map((val, i) => {
            return (
              <div
                onClick={() => {
                  setScriptID(val.ScriptID);
                  setCurrentSlug(i);
                  setCurrentSlugSlugName(val.SlugName)
                }}
                onDoubleClick={() => {
                  handleDoubleClick(i)
                }}
                key={i} style={{ backgroundColor: currentSlug === i ? 'green' : '#E7DBD8', margin: 10 }}>
                {i + 1} <label style={{ cursor: 'pointer' }}>{val.SlugName} </label> <br />
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <div>
          <div>{selectedRunOrderTitle} {currentSlugSlugName}</div>
          <textarea
            value={content}
            rows="25"
            cols="45"
            style={{ fontSize: 20 }}
            disabled
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => {
            var aa = currentSlug;
            aa--;
            if (aa <0) {
              aa = slugs.length-1
            }
            setCurrentSlug(aa);
            handleDoubleClick(aa);
            setCurrentSlugSlugName(slugs[aa].SlugName)
    setScriptID(slugs[aa].ScriptID);
          }}>Previous</button>
          <button onClick={() => {
            var aa = currentSlug;
            aa++;
            if (aa >= slugs.length) {
              aa = 0
            }
            setCurrentSlug(aa);
            handleDoubleClick(aa);
            setCurrentSlugSlugName(slugs[aa].SlugName)
    setScriptID(slugs[aa].ScriptID);
          }}>Next</button>
        </div>
      </div>

      <div>
        <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 500, minHeight: 500 }}>
          <div>
            <div ref={containerRef} className="scroll-container">
              <div ref={textRef} className="scrolling-text">
                {allContent.map((line, i) => (
                  <div key={i} style={{ backgroundColor: i % 2 !== 0 ? 'transparent' : 'blue' }}>{line}</div>
                ))}
              </div>
            </div>
            <div>
              S:{speed}
              <input
                type="range"
                min={-500}
                max={500}
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setSpeed(-200)}> Speed -200</button>
              <button onClick={() => setSpeed(0)}> Pause</button>
              <button onClick={() => setSpeed(200)}> Speed 20</button>
            </div>
          </div>

        </div>
        {/* <div>
          <button
            style={{ backgroundColor: connected ? 'green' : 'red' }}
            onClick={() =>
              endpoint({
                action: 'connect',
              })
            }
          >
            Connect
          </button>
          <button
            onClick={() =>
              endpoint({
                action: 'disconnect',
              })
            }
          >
            DisConnect
          </button>
        </div> */}
      </div>
    </div>

  </div>);
}