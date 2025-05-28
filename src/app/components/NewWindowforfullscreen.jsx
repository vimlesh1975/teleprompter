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
            newWindowRef.current = window.open('', '', `width=${screen.width - 200},height=${screen.height - 200},resizable=no`);
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
        return () => {
            newWindowRef.current.removeEventListener('beforeunload', onClose);
        };
    }, [container, onClose]);

    const childrenWithProps = React.Children.map(children, (child) =>
        cloneElement(child, { scaleFactor })
    );
    return container ? ReactDOM.createPortal(childrenWithProps, container) : null;
}
export default NewWindowforfullscreen;
