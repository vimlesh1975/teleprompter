import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function NewWindow({ children, onClose, newWindowRef }) {
    // const newWindowRef = useRef(null);
    const [container, setContainer] = useState(null);
      // State to keep track of flip status

    const handleTitleBarDoubleClick = () => {
        console.log('Title bar double-clicked');
        container.style.transformOrigin = '0 0';
        container.style.transform = `scale(${newWindowRef.current.screen.width / 600}, ${newWindowRef.current.screen.height / 522} )`;
    };

    const handleRightClick = (event) => {
        event.preventDefault(); // Prevent the default context menu from appearing
        console.log('Right-click detected, flipping content');
     
        // Toggle flip transformation
        if (container.style.transform.includes('rotateY(180deg)')) {
            container.style.transformOrigin = '0 0'; // Center the transform origin
            container.style.transform = container.style.transform.replace('rotateY(180deg)', 'rotateY(0deg)');
        } else {
            container.style.transformOrigin = '24% 0%'; // Center the transform origin
            container.style.transform = container.style.transform + ' rotateY(180deg)';
        }
    };

    useEffect(() => {
        // Check if the new window exists, if not, create it
        if (!newWindowRef.current || newWindowRef.current.closed) {
            newWindowRef.current = window.open('', '', 'width=620,height=540');

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

    // Render the children into the new window's container
    return container ? ReactDOM.createPortal(children, container) : null;
}

export default NewWindow;
