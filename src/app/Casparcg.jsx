'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
const IP = process.env.NEXT_PUBLIC_IP;
import { useRefFromState } from './useRefFromState';


export default function Home({ handleDoubleClick, setAllContent, scrollingTextStyle, scrollContainerStyle, currentFont, fontBold, isRTL, fontColor, slugs, allContent, startPosition, currentStoryNumber, storyLines, crossedLines, showClock, newsReaderText, setSpeed, speed }) {
  const [fliped, setFliped] = useState(false);
  const [socketcurrentstory, setSocketcurrentstory] = useState('not set');
  const socketRef = useRef(null);

  const currentStoryNumberRef = useRefFromState(currentStoryNumber);
  const storyLinesRef = useRefFromState(storyLines);
  const crossedLinesRef = useRefFromState(crossedLines);
  const allContentRef = useRefFromState(allContent);
  const slugsRef = useRefFromState(slugs);
  const startPositionRef = useRefFromState(startPosition);
  const showClockRef = useRefFromState(showClock);
  const newsReaderTextRef = useRefFromState(newsReaderText);
  const isRTLRef = useRefFromState(isRTL);
  const fontColorRef = useRefFromState(fontColor);
  const fontBoldRef = useRefFromState(fontBold);
  const currentFontRef = useRefFromState(currentFont);
  const scrollContainerStyleRef = useRefFromState(scrollContainerStyle);
  const scrollingTextStyleRef = useRefFromState(scrollingTextStyle);
  const speedRef = useRefFromState(speed);

  const handleDoubleClickRef = useRefFromState(handleDoubleClick);


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
    socket.on('casparready2', () => {
      console.log('casparready2 from server');

      socketRef.current.emit('setCurrentStoryNumber', currentStoryNumberRef.current);
      socketRef.current.emit('storyLines', storyLinesRef.current);
      socketRef.current.emit('crossedLines', crossedLinesRef.current);
      socketRef.current.emit('allContent', allContentRef.current);
      socketRef.current.emit('setSlugs', slugsRef.current);
      socketRef.current.emit('setStartPosition', startPositionRef.current);
      socketRef.current.emit('setShowClock', showClockRef.current);
      socketRef.current.emit('setNewsReaderText', newsReaderTextRef.current);
      socketRef.current.emit('rtl', isRTLRef.current);
      socketRef.current.emit('fontColor', fontColorRef.current);
      socketRef.current.emit('fontBold', fontBoldRef.current);
      socketRef.current.emit('currentFont', currentFontRef.current);
      socketRef.current.emit('scrollContainerStyle', scrollContainerStyleRef.current);
      socketRef.current.emit('scrollingTextStyle', scrollingTextStyleRef.current);
      socketRef.current.emit('speed', speedRef.current);

      setTimeout(() => {
        handleDoubleClickRef.current(0);
      }, 2000);

    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // i need only first time
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              // setTimeout(() => {
              //   socketRef.current.emit('setCurrentStoryNumber', currentStoryNumberRef.current);
              //   socketRef.current.emit('storyLines', storyLinesRef.current);
              //   socketRef.current.emit('crossedLines', crossedLinesRef.current);
              //   socketRef.current.emit('allContent', allContentRef.current);
              //   socketRef.current.emit('setSlugs', slugsRef.current);
              //   socketRef.current.emit('setStartPosition', startPositionRef.current);
              //   socketRef.current.emit('setShowClock', showClockRef.current);
              //   socketRef.current.emit('setNewsReaderText', newsReaderTextRef.current);
              //   socketRef.current.emit('rtl', isRTLRef.current);
              //   socketRef.current.emit('fontColor', fontColorRef.current);
              //   socketRef.current.emit('fontBold', fontBoldRef.current);
              //   socketRef.current.emit('currentFont', currentFontRef.current);
              //   socketRef.current.emit('scrollContainerStyle', scrollContainerStyleRef.current);
              //   socketRef.current.emit('scrollingTextStyle', scrollingTextStyleRef.current);
              // }, 4000);

              // setTimeout(() => {
              //   handleDoubleClickRef.current(0);
              // }, 6000);

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
          <div >
          </div>
        </div>
      </div>
    </div>
  );
}
