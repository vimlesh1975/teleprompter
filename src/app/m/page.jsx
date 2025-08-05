'use client'
import React, { useEffect, useState } from 'react'
import socket from '../components/socket'
import ScrollViewforcasparcg from '../components/ScrollViewforcasparcg'
import './controller.css'

const Page = () => {
    const [speed, setSpeed] = useState(0);
    const [tempSpeed, setTempSpeed] = useState(1);

    const scrollwithSpeed = (data) => {
        socket.emit('speedFromMobile', data)
    }
    const next = () => {
        socket.emit('next', '')
    }
    const previous = () => {
        socket.emit('previous', '')
    }
    const fromStart = () => {
        socket.emit('fromStart', '')
    }

    useEffect(() => {
        socket.on('speed2', (data) => {
            setSpeed(data)
        })
    }, [])

    return (<>
        <div >
            <div style={{ transform: `scale(0.5,0.7)`, transformOrigin: 'top left', backgroundColor: 'black', height: 1080, width: 1920, overflow: 'hidden' }}>
                <ScrollViewforcasparcg />
            </div>

            <div style={{ textAlign: 'left', position: 'absolute', top: 760 }}>
                <div >
                    <label style={{ fontSize: 90, color: 'black', fontWeight: 'bolder' }}>Speed :{speed}</label>

                </div>
                <div>
                    <button onClick={fromStart} >
                        fromStart
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <button onClick={previous} >
                            Previous
                        </button>
                    </div>
                    <div>
                        <button onClick={next} >
                            Next
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <button onClick={() => {
                            scrollwithSpeed(speed - 1)
                        }} >
                            Speed -1
                        </button>
                    </div>
                    <div>
                        <button onClick={() => {
                            scrollwithSpeed(speed + 1)
                        }} >
                            Speed +1
                        </button>
                    </div>
                </div>

                <div>
                    <button onClick={() => scrollwithSpeed(0)} >
                        Speed 0
                    </button>
                </div>
                <div>
                    <button onClick={() => {
                        if (speed !== 0) {
                            setTempSpeed(speed);
                            scrollwithSpeed(0);
                        }
                        else {
                            scrollwithSpeed(tempSpeed);
                        }
                    }}>Pause/Resume</button>
                </div>
            </div>
        </div>
    </>)
}

export default Page
