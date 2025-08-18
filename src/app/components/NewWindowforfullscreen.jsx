import React, { useEffect, useState, cloneElement } from 'react';
import ReactDOM from 'react-dom';

function NewWindowforfullscreen({ children, onClose, newWindowRef, scrollWidth, scrollHeight,
    next,
    previous,
    setSpeed,
    speed,
    handleDoubleClick,
    slugs
}) {
    const [container, setContainer] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [tempSpeed, setTempSpeed] = useState(1);
    const [keyPressed, setKeyPressed] = useState("");


    useEffect(() => {
        const handleBeforeUnload = () => {
            if (newWindowRef.current) {
                newWindowRef.current.close();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [newWindowRef]);

    useEffect(() => {
        if (!newWindowRef.current || newWindowRef.current.closed) {
            newWindowRef.current = window.open('', '', `width=${scrollWidth + 20},height=${scrollHeight + 40}`);


        }
        if (!newWindowRef.current) {
            return;
        }
        let containerDiv = newWindowRef.current.document.getElementById('root');
        if (!containerDiv) {
            containerDiv = newWindowRef.current.document.createElement('div');
            containerDiv.setAttribute('id', 'root');
            newWindowRef.current.document.body.appendChild(containerDiv);

            newWindowRef.current.document.body.style.overflow = 'hidden';
            newWindowRef.current.document.body.style.transform = `scale(0.410,0.43)`;

            newWindowRef.current.document.body.style.transformOrigin = 'top left';

        }
        setContainer(containerDiv);
        newWindowRef.current.addEventListener('beforeunload', onClose);


        newWindowRef.current.resizeTo(newWindowRef.current.screen.width - 1, newWindowRef.current.screen.height - 1);
        newWindowRef.current.moveTo(0, 0);
        newWindowRef.current.focus();

        containerDiv.style.transformOrigin = '5px 0';
        const screenHeight = newWindowRef.current.screen.height;

        const knownOrigins = {
            1080: 160,
            1050: 165,
            1024: 160,
            960: 153,
            900: 155,
            864: 155,
            800: 150,
            768: 150,
            720: 140,
            664: 145,
            600: 135,
        };
        const sf = (screenHeight - (knownOrigins[screenHeight] || 150)) / scrollHeight;
        containerDiv.style.transform = `scale(${newWindowRef.current.screen.width / scrollWidth}, ${sf} )`;
        setScaleFactor(sf);

        return () => {
            newWindowRef.current.removeEventListener('beforeunload', onClose);
        };
    }, [newWindowRef, scrollWidth, scrollHeight, onClose]);

    useEffect(() => {
        const win = newWindowRef.current;
        if (!win) return;

        const handleKeyDown = (e) => {
            console.log(e.key)
            if (e.key === 'Escape') {
                onClose?.(); // Close the window
                win.close();
            } else if (e.key === 'ArrowUp') {
                setSpeed(pre => pre + 1);
            } else if (e.key === 'ArrowDown') {
                setSpeed(pre => pre - 1);

            }
            else if (e.key === 'ArrowRight') {
                next();
            }
            else if (e.key === 'ArrowLeft') {
                previous();
            }
            else if (e.key.startsWith('F')) {
                e.preventDefault();
                setSpeed(parseInt(e.key.slice(1)));

            }
            else if (e.key === ' ') {
                if (speed !== 0) {
                    setTempSpeed(speed);
                    setSpeed(0);
                }
                else {
                    setSpeed(tempSpeed);
                }
            }

            else if (e.key === "Enter") {
                handleDoubleClick(parseInt(keyPressed) - 1);
                setKeyPressed("");
            } else {
                if (!isNaN(e.key)) {
                    setKeyPressed((val) => val + e.key);
                }
            }
        };
        const handleRightClick = (e) => {
            e.preventDefault(); // Prevent default right-click menu
            if (speed !== 0) {
                setTempSpeed(speed);
                setSpeed(0);
            }
            else {
                setSpeed(tempSpeed);
            }
        };

        const handleWheel = (e) => {
            // console.log("Mouse wheel delta:", e.deltaY);
            if (e.deltaY > 0) {
                setSpeed(speed - 1);
            } else {
                setSpeed(speed + 1);
            }
            e.preventDefault(); // Block default scroll if needed
        };

        // const handleClick = (e) => {
        //     if (e.button !== 0) return; // Only left click
        //     next();
        // };

        win.document.addEventListener('keydown', handleKeyDown);
        win.document.addEventListener('contextmenu', handleRightClick); // Add this
        win.document.addEventListener('wheel', handleWheel, { passive: false });
        // win.document.addEventListener("click", handleClick);


        return () => {

            win.document.removeEventListener('keydown', handleKeyDown);
            win.document.removeEventListener('contextmenu', handleRightClick); // Clean up
            win.document.removeEventListener('wheel', handleWheel);
            // win.document.removeEventListener("click", handleClick);

        };
    }, [
        newWindowRef,
        scrollWidth,
        scaleFactor,
        onClose,
        handleDoubleClick,
        setSpeed,
        speed,
        tempSpeed,
        keyPressed,
        next,
        previous
    ]);


    const childrenWithProps = React.Children.map(children, (child) =>
        cloneElement(child, { scaleFactor })
    );

    const styel1 = {
        position: 'absolute',
        top: 15,
        left: 805,
        zIndex: 9999,
        backgroundColor: 'red',
        color: 'white',
        padding: '2px 2px',
        fontSize: 16,
    }


    // return container ? ReactDOM.createPortal(childrenWithProps, container) : null;
    return container ? ReactDOM.createPortal(
        <>
            {childrenWithProps}
            <div style={styel1}>
                <button style={{ fontSize: 'inherit' }} onClick={() => handleDoubleClick(0)}  >From Start</button>
                <button style={{ fontSize: 'inherit' }} onClick={() => handleDoubleClick(slugs.length - 1)} >Go to Last</button>
                <button style={{ fontSize: 'inherit' }} onClick={previous} >Previous</button>
                <button style={{ fontSize: 'inherit' }} onClick={next} >Next</button>
                Speed:<button style={{ fontSize: 'inherit' }} onClick={() => setSpeed(0)} >0</button>
                <button style={{ fontSize: 'inherit' }} onClick={() => setSpeed(1)} >1</button>
                <button style={{ fontSize: 'inherit' }} onClick={() => setSpeed(2)} >2</button>
                <button style={{ fontSize: 'inherit' }} onClick={() => setSpeed(3)} >3</button>




            </div>
            <div style={{ ...styel1, fontSize: 16, marginLeft: 20, left: 1300 }}>
                <label style={{ color: 'black', fontWeight: 'bolder' }}>Go To</label>
                <select onChange={(e) => handleDoubleClick(Number(e.target.value))}>
                    <option value="">Select</option>
                    {Array.from({ length: slugs.length }, (_, i) => (
                        <option key={i} value={i}>
                            {i + 1}
                        </option>
                    ))}
                </select>
            </div>
        </>,
        container
    ) : null;

}
export default NewWindowforfullscreen;