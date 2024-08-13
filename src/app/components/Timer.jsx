import React, { useState, useEffect, useCallback } from 'react';

function Timer({ callback, interval = 1000 }) {
    const [isActive, setIsActive] = useState(false); // State to track if the timer is running

    // Memoize the callback to avoid unnecessary re-renders
    const memoizedCallback = useCallback(callback, [callback]);

    useEffect(() => {
        let timerId;

        if (isActive) {
            // Set up the interval to execute the callback
            timerId = setInterval(() => {
                memoizedCallback();
            }, interval);
        }

        // Clean up the interval on component unmount or when the timer is paused
        return () => clearInterval(timerId);
    }, [isActive, memoizedCallback, interval]);

    // Toggle the timer's active state
    const toggle = () => {
        setIsActive(!isActive);
    };

    return (
        <div>
            <button onClick={toggle}>
                {isActive ? 'test timer Pause' : 'test timer Start'}
            </button>
        </div>
    );
}

export default Timer;
