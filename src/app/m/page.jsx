'use client'
import React, { useEffect, useState } from 'react'
import socket from '../components/socket'
import ScrollViewforcasparcgM from '../components/ScrollViewforcasparcgM'
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
    const fromStart = (data) => {
        socket.emit('fromStart', data)
    }

    useEffect(() => {
        socket.on('speed2', (data) => {
            setSpeed(data)
        })
    }, [])

    return (<>
        <div >
            <div style={{ transform: `scale(0.5,0.7)`, transformOrigin: 'top left', backgroundColor: 'black', height: 1080, width: 1920, overflow: 'hidden' }}>
                <ScrollViewforcasparcgM />
                {/* <iframe style={{ width: '1920px', height: '1080px', border: 'none' }} src="/webrtc.html" frameborder="0"></iframe> */}
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ textAlign: 'left', position: 'absolute', top: 760 }}>
                    <div >
                        <label style={{ fontSize: 90, color: 'black', fontWeight: 'bolder' }}>Speed :{speed}</label>

                    </div>
                    <div>
                        <button onClick={() => fromStart(0)} >
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
                <div style={{ textAlign: 'left', position: 'absolute', top: 760, left: 800, height: 1000, width: 150, overflowY: 'scroll', backgroundColor: 'white' }}>
                    <label style={{ fontSize: 90, color: 'black', fontWeight: 'bolder' }}>Go To</label>
                    {Array.from({ length: 100 }, (_, i) => (
                        <button key={i} onClick={() => fromStart(i)}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>




        </div>
    </>)
}

export default Page
