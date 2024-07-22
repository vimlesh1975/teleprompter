import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function NewWindow({ children, onClose, newWindowRef }) {
    // const newWindowRef = useRef(null);
    const [container, setContainer] = useState(null);

    const handleTitleBarDoubleClick = () => {
        console.log('Title bar double-clicked');
        container.style.transformOrigin = '0 0';
        container.style.transform = `scale(${newWindowRef.current.screen.width / 600}, ${newWindowRef.current.screen.height / 500} )`;
    };


    useEffect(() => {
        // Check if the new window exists, if not, create it
        if (!newWindowRef.current || newWindowRef.current.closed) {
            newWindowRef.current = window.open('', '', 'width=640,height=555');

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


        // Cleanup function
        return () => {
            newWindowRef.current.removeEventListener('beforeunload', onClose);
            newWindowRef.current.removeEventListener('dblclick', handleTitleBarDoubleClick);
            // Do not close the window here to keep it open for future updates
        };
    }, [container, onClose, handleTitleBarDoubleClick]);

    // Render the children into the new window's container
    return container ? ReactDOM.createPortal(children, container) : null;
}

export default NewWindow;
