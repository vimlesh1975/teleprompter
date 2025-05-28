import React, { useEffect, useState, cloneElement } from 'react';
import ReactDOM from 'react-dom';

function NewWindowforfullscreen({ children, onClose, newWindowRef, scrollWidth, scrollHeight }) {
    // const newWindowRef = useRef(null);
    const [container, setContainer] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    // State to keep track of flip status

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
    }, []);

    useEffect(() => {
        // Check if the new window exists, if not, create it
        if (!newWindowRef.current || newWindowRef.current.closed) {
            newWindowRef.current = window.open('', '', `width=${scrollWidth + 20},height=${scrollHeight + 40}`);

            // newWindowRef.current = window.open('', '', `width=${screen.width * 0.99},height=${screen.height * 0.99}`);
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
            newWindowRef.current.document.body.style.transform = `scale(0.410,0.43)`;

            newWindowRef.current.document.body.style.transformOrigin = 'top left';
        }
        setContainer(containerDiv);
        newWindowRef.current.addEventListener('beforeunload', onClose);


        newWindowRef.current.resizeTo(newWindowRef.current.screen.width, newWindowRef.current.screen.height);
        newWindowRef.current.moveTo(0, 0);

        console.log('Title bar double-clicked');
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
    }, [container, onClose]);


    useEffect(() => {

    })

    const childrenWithProps = React.Children.map(children, (child) =>
        cloneElement(child, { scaleFactor })
    );
    return container ? ReactDOM.createPortal(childrenWithProps, container) : null;
}
export default NewWindowforfullscreen;
