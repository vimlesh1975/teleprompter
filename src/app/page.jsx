'use client';

import { useState, useEffect } from 'react';
import ScrollingText from './components/ScrollingText'


export default function Home() {

  const [connected, setConnected] = useState(false);

  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');
  const [slugs, setSlugs] = useState([]);
  const [ScriptID, setScriptID] = useState('');
  const [currentSlug, setCurrentSlug] = useState(-1);
  const [currentSlugSlugName, setCurrentSlugSlugName] = useState('');

  const [content, setContent] = useState('');
  const [allContent, setAllContent] = useState('');


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

  useEffect(() => {
    var aa;
    async function fetchData() {
      try {
        const res = await fetch(`/api/slug?param1=${selectedRunOrderTitle}`);
        aa=await (await res.json()).data
        setSlugs(aa);
      } catch (error) {
        console.error(error);
      }
    }

 

    const fetchAllContent = async () => {
      const data1 = new Array(aa.length * 2); // Creating an array with double the length to store index and script content
      const fetchPromises = aa.map((slug, i) => fetch(`/api/script?ScriptID=${slug.ScriptID}`)
        .then(async (res) => {
          const data = (await res.json()).data?.Script
          data1[i * 2] = `${i + 1} ${slug.SlugName}`;
          data1[i * 2 + 1] = `${data}\n_ _ _ _ _ _ _\n`;
        })
        .catch(error => {
          console.error('Error fetching content:', error);
        })
      );
  
      // Await all fetch promises to complete
      await Promise.all(fetchPromises);
      setAllContent(data1.filter(item => item !== undefined))
      // return data1.filter(item => item !== undefined); // Filter out any undefined entries
    };
    fetchData().then(()=>fetchAllContent())//


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
              <div onClick={() => {
                setScriptID(val.ScriptID);
                setCurrentSlug(i);
                setCurrentSlugSlugName(val.SlugName)
              }} key={i} style={{ backgroundColor: currentSlug === i ? 'green' : '#E7DBD8', margin: 10 }}>
                {i} <label style={{ cursor: 'pointer' }}>{val.SlugName} </label> <br />
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <textarea
          value={content}
          rows="31"
          cols="45"
          style={{ fontSize: 20 }}
          disabled
        />
      </div>
      <div>
        <div style={{ maxWidth: 600, minWidth: 600, maxHeight: 500, minHeight: 500 }}>
          {/* <ScrollingText text={content} /> */}
          <ScrollingText text={allContent} />
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