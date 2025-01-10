import React, { useEffect, useState ,cloneElement } from 'react';
import ReactDOM from 'react-dom';

function NewWindow({ children, onClose, newWindowRef, scrollWidth, scrollHeight }) {
    // const newWindowRef = useRef(null);
    const [container, setContainer] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    // State to keep track of flip status

    const handleTitleBarDoubleClick = () => {
        console.log('Title bar double-clicked');
        container.style.transformOrigin = '5px 0';
        const screenHeight = newWindowRef.current.screen.height;

        const knownOrigins = {
            1080: 160,
            1050: 165,
            1024: 160,
            960: 253,
            900: 155,
            864: 238,
            800: 150,
            768: 150,
            720: 140,
            664: 145,
            600: 130,
        };
        const sf= (screenHeight-(knownOrigins[screenHeight] || 150)) / scrollHeight;
        container.style.transform = `scale(${newWindowRef.current.screen.width / scrollWidth}, ${sf} )`;
        setScaleFactor(sf);
    };

    const handleRightClick = (event) => {
        event.preventDefault(); // Prevent the default context menu from appearing
        console.log('Right-click detected, flipping content');

        const screenWidth = newWindowRef.current.screen.width;

        const knownOrigins = {
            1920: 555,
            1680: 530,
            1600: 523,
            1440: 505,
            1366: 495,
            1360: 495,
            1280: 483,
            1176: 466,
            1152: 462,
            1024: 440,
            800: 392,
        };

        // Calculate transform origin using the linear formula if not in known origins
        const transformOriginX = knownOrigins[screenWidth] || (0.0893 * screenWidth + 284);

        // Toggle flip transformation
        if (container.style.transform.includes('rotateY(180deg)')) {
            container.style.transformOrigin = '5px 0';
            container.style.transform = container.style.transform.replace('rotateY(180deg)', 'rotateY(0deg)');
        } else {
            container.style.transformOrigin = `${transformOriginX}px 0%`;
            container.style.transform = container.style.transform + ' rotateY(180deg)';
        }
    };


    useEffect(() => {
        // Check if the new window exists, if not, create it
        if (!newWindowRef.current || newWindowRef.current.closed) {
            newWindowRef.current = window.open('', '', `width=${scrollWidth+20},height=${scrollHeight+40}`);
        }

        // Ensure the window is still available
        if (!newWindowRef.current) {
            return;
        }

        // Create a container div for the React component if not already created
        // Check if the container div already exists
        let containerDiv = newWindowRef.current.document.getElementById('root');
        if (!containerDiv) {
            containerDiv = newWindowRef.current.document.createElement('div');
            containerDiv.setAttribute('id', 'root');
            newWindowRef.current.document.body.appendChild(containerDiv);

            newWindowRef.current.document.body.style.overflow = 'hidden';


        }
        setContainer(containerDiv);

        // Add event listener to clean up on close
        newWindowRef.current.addEventListener('beforeunload', onClose);
        newWindowRef.current.addEventListener('dblclick', handleTitleBarDoubleClick);
        newWindowRef.current.addEventListener('contextmenu', handleRightClick);


        // Cleanup function
        return () => {
            newWindowRef.current.removeEventListener('beforeunload', onClose);
            newWindowRef.current.removeEventListener('dblclick', handleTitleBarDoubleClick);
            newWindowRef.current.removeEventListener('contextmenu', handleRightClick);
            // Do not close the window here to keep it open for future updates
        };
    }, [container, onClose, handleTitleBarDoubleClick]);

    const childrenWithProps = React.Children.map(children, (child) =>
        cloneElement(child, { scaleFactor })
    );

    // Render the children into the new window's container
    return container ? ReactDOM.createPortal(childrenWithProps, container) : null;
}

export default NewWindow;
