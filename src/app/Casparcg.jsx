'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
const IP = process.env.NEXT_PUBLIC_IP;

export default function Home({ handleDoubleClick, setAllContent, scrollingTextStyle, scrollContainerStyle, currentFont, fontBold, isRTL, fontColor, slugs, allContent, startPosition, currentStoryNumber, storyLines, crossedLines, showClock, newsReaderText, setSpeed }) {
  const [socketcurrentstory, setSocketcurrentstory] = useState('not set');
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io();

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('SOCKET CONNECTED! from casparcg page', socket.id);
    });

    socket.on('currentStoryBroadcast', (data) => {
      setSocketcurrentstory(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);


  const endpoint = async (str) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(str),
    };
    await fetch('/api/casparcg', requestOptions);
    if (str.action === 'connect' || str.action === 'disconnect') {
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
          <button onClick={() => setSpeed(1)}> Start with Speed 1</button>
          {socketcurrentstory.ScriptID}
        </div>
        <div>
          <button
            onClick={() => {

              endpoint({
                action: 'endpoint',
                command: `Play 1-97 [html] "http://${IP}:3000/CasparcgOutput"`,
              });
              playOnSecondChannelinFlippedMode();
              setTimeout(() => {
                socketRef.current.emit('setCurrentStoryNumber', currentStoryNumber);
                socketRef.current.emit('storyLines', storyLines);
                socketRef.current.emit('crossedLines', crossedLines);
                socketRef.current.emit('allContent', allContent);
                socketRef.current.emit('setSlugs', slugs);
                socketRef.current.emit('setStartPosition', startPosition);
                socketRef.current.emit('setShowClock', showClock);
                socketRef.current.emit('setNewsReaderText', newsReaderText);
                socketRef.current.emit('rtl', isRTL);
                socketRef.current.emit('fontColor', fontColor);
                socketRef.current.emit('fontBold', fontBold);
                socketRef.current.emit('currentFont', currentFont);
                socketRef.current.emit('scrollContainerStyle', scrollContainerStyle);
                socketRef.current.emit('scrollingTextStyle', scrollingTextStyle);

              }, 3000);
              setTimeout(() => {
                handleDoubleClick(0);
              }, 4000);
            }
            }
          >
            Start Teleprompting in Caspar with Normal Method
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              endpoint({
                action: 'endpoint',
                command: `play 1-97 [html] http://${IP}:3000/webrtc.html`,
              });
              handleDoubleClick(0);

              playOnSecondChannelinFlippedMode();
            }
            }
          >
            Start Teleprompting in Caspar with Screen Capture Method
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
                setAllContent([]);
              }
              }
            >
              Stop  Output
            </button>
          </div>
          <div >
          </div>
        </div>
      </div>
    </div>
  );
}
