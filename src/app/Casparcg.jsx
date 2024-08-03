'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';
const Clock = dynamic(() => import('./components/Clock'), { ssr: false });


const socket = io();
socket.on('connect', () => {
  console.log('SOCKET CONNECTED! from caspar', socket.id);
});

export default function Home() {

  const [connected, setConnected] = useState(false);
  const [fliped, setFliped] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('SOCKET CONNECTED!', socket.id);
    });
    socket.on('ServerConnectionStatus2', (msg) => {
      console.log(msg)
      setConnected(msg);
    });
    return () => {
      socket.off('ServerConnectionStatus2');
      // socket.disconnect();
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
              command: `play 1-2 [html] http://localhost:3000/webrtc.html`,
            })
          }
        >
          Show in casparcg Web RTC
        </button>
   
 
        <button
          onClick={() =>
            endpoint({
              action: 'endpoint',
              command: `Play 1-2 [html] "http://localhost:3000/test"`,
            })
          }
        >
          Show React componenet
        </button>
        <button
          onClick={() => {
            endpoint({
              action: 'endpoint',
              command: fliped ? 'mixer 1-2 fill 1 0 -1 1' : 'mixer 1-2 fill 0 0 1 1',
            });
            setFliped(val => !val);
          }}
        >
          Toggle Flip
        </button>
        <button
          onClick={() =>
            endpoint({
              action: 'endpoint',
              command: `stop 1-2`,
            })
          }
        >
          Stop
        </button>
      </div>

    </div>
  );
}
