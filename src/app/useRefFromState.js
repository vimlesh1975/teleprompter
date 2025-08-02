// useRefFromState.js
import { useRef, useEffect } from 'react';

export function useRefFromState(value) {
    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
}
