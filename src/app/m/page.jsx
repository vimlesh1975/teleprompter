'use client'
import React, { useEffect, useState } from 'react'
import socket from '../components/socket'

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
            Speed :{speed}
            <button onClick={fromStart} >
                fromStart
            </button>
            <div style={{ display: 'flex' }}>
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
            <div style={{ display: 'flex' }}>
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


            <div style={{ display: 'flex' }}>


                <div>
                    <button onClick={() => scrollwithSpeed(-3)} >
                        Speed -3
                    </button>
                </div>
                <div>
                    <button onClick={() => scrollwithSpeed(-2)} >
                        Speed -2
                    </button>
                </div>
                <div>
                    <button onClick={() => scrollwithSpeed(-1)} >
                        Speed -1
                    </button>
                </div>
                <button onClick={() => scrollwithSpeed(0)} >
                    Speed 0
                </button>

                <div>
                    <button onClick={() => scrollwithSpeed(1)} >
                        Speed 1
                    </button>
                </div>
                <div>
                    <button onClick={() => scrollwithSpeed(2)} >
                        Speed 2
                    </button>
                </div>
                <div>
                    <button onClick={() => scrollwithSpeed(3)} >
                        Speed 3
                    </button>
                </div>

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
    </>)
}

export default Page
