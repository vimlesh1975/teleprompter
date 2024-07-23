'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const sectohmsm = (totalSeconds) => {
  if (totalSeconds < 0) {
    totalSeconds = 0;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);
  const hmsms = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  return hmsms; // Output: "0:20:34.560"
};

export default function Casparcg() {
  const [command, setCommand] = useState('play 1-1 amb loop');

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // const socket = io('http://localhost:3000');
    const socket = io();
    socket.on('connect', () => {
      console.log('SOCKET CONNECTED!', socket.id);
    });

    socket.on('ServerConnectionStatus', (msg) => {
      console.log(msg)
      setConnected(msg);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div>
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
        <button
          onClick={() =>
            endpoint({
              action: 'endpoint',
              command: 'play 1-1 go1080p25 loop',
            })
          }
        >
          Play go1080p25
        </button>
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

    </div>
  );
}
