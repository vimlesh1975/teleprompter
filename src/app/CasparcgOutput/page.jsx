'use client'

import { useEffect, useRef } from 'react'

import ScrollViewforcasparcg from '../components/ScrollViewforcasparcg';
import io from 'socket.io-client';


const Page = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit('casparready', '');
    return () => {
      socketRef.current = null;
    };
  }, [])


  return (
    <div style={{
      transform: `scale(${1}, ${0.94})`,
      transformOrigin: "top left",
    }} >
      <ScrollViewforcasparcg />
    </div>
  );
};

export default Page;
