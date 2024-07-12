'use client';

import { useState, useEffect } from 'react';


export default function Home() {
  const [command, setCommand] = useState('play 1-1 amb loop');

  const [connected, setConnected] = useState(false);

  const [runOrderTitles, setRunOrderTitles] = useState([]);
  const [selectedRunOrderTitle, setSelectedRunOrderTitle] = useState('');

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
        const data = await res.json();
        setRunOrderTitles(data.RunOrderTitles);
      } catch (error) {
        console.error('Error fetching RunOrderTitles:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>This is Casparcg Next Js Client</h1>
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
      </div>
      <div>
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
      <button
        onClick={() =>
          endpoint({
            action: 'endpoint',
            command: 'play 1-1 red',
          })
        }
      >
        Play red color
      </button>
      <div>
        <span>Command:</span>
        <input value={command} onChange={(e) => setCommand(e.target.value)} />
        <button
          onClick={() =>
            endpoint({
              action: 'endpoint',
              command: command,
            })
          }
        >
          Play Command
        </button>
      </div>

      <div >
        Run Orders:<select value={selectedRunOrderTitle} onChange={handleSelectionChange}>
          <option value="" disabled>Select a Run Order</option>
          {runOrderTitles && runOrderTitles.map((runOrderTitle, i) => (
            <option key={i} value={runOrderTitle.title}>{runOrderTitle.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}