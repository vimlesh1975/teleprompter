'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
const IP = process.env.NEXT_PUBLIC_IP;

export default function Home({ fontBold, isRTL, bgColor, fontColor, slugs, allContent, startPosition, fontSize, newPosition, currentStoryNumber, storyLines, crossedLines, showClock, newsReaderText, setSpeed }) {

  const [connected, setConnected] = useState(false);
  const [fliped, setFliped] = useState(false);
  const [socketcurrentstory, setSocketcurrentstory] = useState('not set');

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('SOCKET CONNECTED! from caparcg page', socketRef.current.id);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []);


  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('connect', () => {
      console.log('SOCKET CONNECTED! form casparcg connection', socketRef.current.id);
    });
    socketRef.current.on('ServerConnectionStatus2', (msg) => {
      setConnected(msg);
    });

    socketRef.current.on('currentStoryBroadcast', (data) => {
      // setSocketcurrentstory(JSON.parse(data).curstory)
      setSocketcurrentstory(data);
    });

    socketRef.current.on('connect_error', (error) => {
      setConnected(false);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });


    return () => {
      socketRef.current?.off('connect');
      socketRef.current?.off('ServerConnectionStatus2');
      socketRef.current?.off('currentStoryBroadcast');
      socketRef.current?.off('ServerConnectconnect_errorionStatus2');
      socketRef.current?.off('disconnect');
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

  const playOnSecondChannelinFlippedMode = () => {
    endpoint({
      action: 'endpoint',
      command: `play 2-97 route://1`
    });
    endpoint({
      action: 'endpoint',
      command: `mixer 2-97 fill 1 0 -1 1`
    });
  }

  return (
    <div>
      <div>
        <div>
          For Casparcg Output <button
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
          {/* <span>{socketcurrentstory.curstory} {socketcurrentstory.curbulletin} {socketcurrentstory.ScriptID}</span> */}
          <button onClick={() => setSpeed(1)}> Start with Speed 1</button>
        </div>
        <div>
          Method 1:
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `Play 1-97 [html] "http://${IP}:3000/CasparcgOutput"`,
              });
              endpoint({
                action: 'endpoint',
                command: !fliped ? 'mixer 1-97 fill -0.01 -0.02 2.45 2.35' : 'mixer 1-97 fill 1.02 -0.02 -2.48 2.35',
              });

              playOnSecondChannelinFlippedMode();
              setTimeout(() => {
                socketRef.current.emit('newPosition', newPosition);
                socketRef.current.emit('setCurrentStoryNumber', currentStoryNumber);
                socketRef.current.emit('storyLines', storyLines);
                socketRef.current.emit('crossedLines', crossedLines);
                socketRef.current.emit('allContent', allContent);
                socketRef.current.emit('setSlugs', slugs.length);

                socketRef.current.emit('setFontSize', fontSize);
                socketRef.current.emit('setStartPosition', startPosition);

                socketRef.current.emit('setShowClock', showClock);
                socketRef.current.emit('setNewsReaderText', newsReaderText);

                socketRef.current.emit('rtl', isRTL);
                socketRef.current.emit('bgColor', bgColor);
                socketRef.current.emit('fontColor', fontColor);
                socketRef.current.emit('fontBold', fontBold);

              }, 3000);
            }

            }
          >
            Normal Method
          </button>

          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: !fliped ? 'mixer 1-97 fill -0.01 -0.02 2.45 2.35' : 'mixer 1-97 fill 1.02 -0.02 -2.48 2.35',

              });
              setFliped(val => !val);
            }}
          >
            Toggle Flip
          </button>
        </div>
        <div>
          Method 2:
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `play 1-97 [html] http://${IP}:3000/webrtc.html`,
              });
              endpoint({
                action: 'endpoint',
                command: fliped ? 'mixer 1-97 fill 1 0 -1 1' : 'mixer 1-97 fill 0 0 1 1',
              });
              playOnSecondChannelinFlippedMode();
            }
            }
          >
            Screen Capture Method
          </button>
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: !fliped ? 'mixer 1-97 fill 1 0 -1 1' : 'mixer 1-97 fill 0 0 1 1',
              });
              setFliped(val => !val);
            }}
          >
            Toggle Flip
          </button>

        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <button
              onClick={() => {
                endpoint({
                  action: 'endpoint',
                  command: `stop 1-97`,
                });
                endpoint({
                  action: 'endpoint',
                  command: `mixer 1-97 clear`,
                });
              }
              }
            >
              Stop Caspar Output
            </button>
          </div>
          <div >
            <button onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `play 2-97 route://1`
              });
              endpoint({
                action: 'endpoint',
                command: `mixer 2-97 fill 0 0 1 1`
              });
            }}>Play 2nd channel </button>
            <button onClick={() => {
              playOnSecondChannelinFlippedMode();
            }}>Play 2nd channel flip mode</button>
            <button onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `stop 2-97`
              });
              endpoint({
                action: 'endpoint',
                command: `mixer 2-97 clear`
              });
            }}>Stop 2nd Channel</button>
          </div>

        </div>
      </div>

    </div>
  );
}
