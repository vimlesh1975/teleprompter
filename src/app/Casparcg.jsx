'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();
socket.on('connect', () => {
  console.log('SOCKET CONNECTED! from caspar', socket.id);
});

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

export default function Home({ slugs, allContent }) {

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
        <div>
          <button
            onClick={() =>{
              endpoint({
                action: 'endpoint',
                command: `play 1-2 [html] http://localhost:3000/webrtc.html`,
              });
              endpoint({
                action: 'endpoint',
                command: fliped ? 'mixer 1-2 fill 1 0 -1 1' : 'mixer 1-2 fill 0 0 1 1',
              });
            }
            }
          >
            Show in casparcg Web RTC
          </button>
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: !fliped ? 'mixer 1-2 fill 1 0 -1 1' : 'mixer 1-2 fill 0 0 1 1',
              });
              setFliped(val => !val);
            }}
          >
            Toggle Flip Web RTC
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `Play 1-2 [html] "http://localhost:3000/test"`,
              });
              endpoint({
                action: 'endpoint',
                command: !fliped ? 'mixer 1-2 fill -0.02 -0.015 3.21 2.02':'mixer 1-2 fill 1.02 -0.015 -3.21 2.02' ,
              });
              setTimeout(() => {
                endpoint({
                  action: 'endpoint',
                  command: `call 1-2 setSlugs(${JSON.stringify(slugs.map(item => item.SlugName))})`,
                });
                endpoint({
                  action: 'endpoint',
                  command: `call 1-2 setAllContent1(${JSON.stringify(replaceCRLFInArray(allContent)).replaceAll('"', '\\"')})`,
                })
              }, 1000);
            }

            }
          >
            Show React componenet
          </button>

          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: fliped ? 'mixer 1-2 fill -0.02 -0.015 3.21 2.02':'mixer 1-2 fill 1.02 -0.015 -3.21 2.02' ,
              });
              setFliped(val => !val);
            }}
          >
            Toggle Flip React Componenet
          </button>
        </div>
        <button
          onClick={() => {
            endpoint({
              action: 'endpoint',
              command: `stop 1-2`,
            });
            endpoint({
              action: 'endpoint',
              command: `mixer 1-2 clear`,
            });

          }
          }
        >
          Stop Caspar Output
        </button>
        {/* {fliped.toString()} */}
      </div>

    </div>
  );
}
