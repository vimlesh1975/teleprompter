'use client';

import { useState, useEffect } from 'react';


export default function Home() {
  const [command, setCommand] = useState('play 1-1 amb loop');

  const [connected, setConnected] = useState(false);

  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');
  const [slugs, setSlugs] = useState([]);
  const [ScriptID, setScriptID] = useState('');
  const [currentSlug, setCurrentSlug] = useState(-1);
  const [currentSlugSlugName, setCurrentSlugSlugName] = useState('');

  const [content, setContent] = useState('');


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
    async function fetchData() {
      try {
        const res = await fetch(`/api/slug?param1=${selectedRunOrderTitle}`);
        setSlugs((await res.json()).data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [selectedRunOrderTitle]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/script?ScriptID=${ScriptID}`);
        setContent((await res.json()).data.Script);
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
      </div>
    </div>

  </div>);
}