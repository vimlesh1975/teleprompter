'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import io from 'socket.io-client';
import ScrollView from './ScrollView';
import { changeStoryLines, changeCrossedLines } from '../store/store';

import { useDispatch, useSelector } from 'react-redux';

function moveZerosToFront(arr) {
    return [...arr.filter(n => n === 0), ...arr.filter(n => n !== 0)];
}

var dd = 0;

const Scroll = ({ scrollContainerStyle, scrollingTextStyle,
    currentFont, fontBold, isRTL, fontColor,
    scaleFactor = 1, scrollWidth, scrollHeight, fontSize,
    setCurrentSlug, newPosition, setNewPosition,
    doubleClickedPosition, textRef, startPosition,
    allContent, showClock, speed, loggedPositions,
    setLoggedPositions, currentStoryNumber, setCurrentStoryNumber,
    slugs, newsReaderText, setSpeed, contentRefs
}) => {

    const dispatch = useDispatch();
    const storyLines = useSelector((state) => state.storyLinesReducer.storyLines);
    const crossedLines = useSelector((state) => state.crossedLinesReducer.crossedLines);

    const socketRef = useRef(null);

    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleX = scrollWidth / baseWidth;
    const scaleY = scrollHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY); // keep aspect ratio

    const scrollContainerRef = useRef(null); // 👈 Add this
    const prevContentHeight = useRef(0);
    const prevstoryLines = useRef([]);



    useEffect(() => {
        socketRef.current = io();
        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        socketRef.current?.emit('setCurrentStoryNumber', currentStoryNumber);
    }, [currentStoryNumber]);

    useEffect(() => {
        socketRef.current?.emit('crossedLines', crossedLines);
    }, [crossedLines]);

    useEffect(() => {
        socketRef.current?.emit('storyLines', storyLines);
    }, [storyLines]);

    useEffect(() => {
        socketRef.current?.emit('newPosition', newPosition);
    }, [newPosition]);

    useEffect(() => {
        let animationFrameId;

        const scrollText = () => {
            if (textRef.current) {
                const { top, height } = textRef.current.getBoundingClientRect();
                if (top < -height) {
                    setSpeed(0);
                    return;
                }

                setNewPosition(prev => parseFloat((prev - speed * 1.2).toFixed(2)));

                const startPositionDivIndex = contentRefs.current.findIndex((ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        return (rect.top / scale <= startPosition && rect.bottom / scale > startPosition);
                    }
                    return false;
                });

                if (startPositionDivIndex !== -1 && startPositionDivIndex % 3 === 0) {
                    if (!loggedPositions.has(startPositionDivIndex)) {
                        const curstory = ((startPositionDivIndex) / 3) + 1 + doubleClickedPosition;
                        setCurrentStoryNumber(curstory);
                        setCurrentSlug(curstory - 1);
                        setLoggedPositions((prev) => new Set(prev).add(startPositionDivIndex));
                    }
                }

                let linesCrossed = 0;
                const ref = contentRefs.current[(-doubleClickedPosition + currentStoryNumber - 1) * 3];
                if (ref) {
                    const rect = ref.getBoundingClientRect();
                    const style = getComputedStyle(ref);
                    const lineHeight = parseFloat(style.lineHeight);

                    const scaledTop = rect.top / scale;
                    if (scaledTop < startPosition) {
                        linesCrossed = 1 + Math.floor((startPosition - scaledTop) / lineHeight);
                        if (linesCrossed > storyLines[currentStoryNumber - 1]) {
                            linesCrossed = storyLines[currentStoryNumber - 1];
                        }
                    }
                }
                if (linesCrossed !== crossedLines) {
                    dispatch(changeCrossedLines(linesCrossed));
                }
            }

            animationFrameId = requestAnimationFrame(scrollText);
        };

        animationFrameId = requestAnimationFrame(scrollText);
        return () => cancelAnimationFrame(animationFrameId);
    }, [contentRefs, crossedLines, dispatch, scale, setCurrentSlug, setCurrentStoryNumber, setLoggedPositions, setNewPosition, setSpeed, textRef, scaleFactor, speed, doubleClickedPosition, startPosition, loggedPositions, currentStoryNumber, storyLines]);

    const calculateNumberOfLines = (element) => {
        if (element) {
            const style = getComputedStyle(element);
            const lineHeight = parseFloat(style.lineHeight);
            const height = element.clientHeight;
            return height / lineHeight;
        }
        return 0;
    };




    useEffect(() => {


        if (!slugs) return;

        // const index = (currentStoryNumber - 1) * 3;
        // const refBefore = contentRefs.current[index];
        // const topBefore = refBefore?.getBoundingClientRect().top;

        // requestAnimationFrame(() => {
        //     const refAfter = contentRefs.current[index];
        //     const topAfter = refAfter?.getBoundingClientRect().top;

        //     if (topBefore !== undefined && topAfter !== undefined) {
        //         const diff = topAfter - topBefore;
        //         scrollContainerRef.current.scrollTop += diff; // Adjust only scroll inside container
        //     }
        // });

        const storiesLines = [];
        for (let i = 0; i < slugs.length * 3; i += 3) {
            const totalLines =
                calculateNumberOfLines(contentRefs.current[i]) +
                calculateNumberOfLines(contentRefs.current[i + 1]) +
                calculateNumberOfLines(contentRefs.current[i + 2]);

            const flooredLines = totalLines > 0 ? 1 + Math.floor(totalLines) : 0;
            storiesLines.push(flooredLines);
        }

        const result = moveZerosToFront(storiesLines);
        dispatch(changeStoryLines(result));
        socketRef.current.emit('storyLines', result);
    }, [allContent, fontSize, contentRefs, slugs, dispatch]);

    useEffect(() => {
        prevContentHeight.current = textRef.current.offsetHeight;
        prevstoryLines.current = [...storyLines];

    }, [doubleClickedPosition])
    useEffect(() => {
        const afterHeight = textRef.current?.offsetHeight || 0;
        const diff = afterHeight - prevContentHeight.current;
        console.log(diff)
        // Adjust scroll position
        if (scrollContainerRef.current) {
            prevContentHeight.current = afterHeight;
            dd = dd + 1;
            console.log(dd)

            const oldArr = prevstoryLines.current;
            const newArr = storyLines;
            prevstoryLines.current = [...storyLines]
            const changed = [];

            for (let i = 0; i < Math.max(oldArr.length, newArr.length); i++) {
                if (oldArr[i] !== newArr[i]) {
                    changed.push({
                        index: i,
                        oldValue: oldArr[i],
                        newValue: newArr[i],
                    });
                }
            }

            console.log(oldArr);
            console.log(newArr);
            console.log(changed);
            if (dd < 4) return;
            if (changed.length === 0) return
            if (currentStoryNumber < changed.index) return

            setNewPosition((pos) => pos - diff); // Adjust to keep same line visible
        }

    }, [allContent]); // Trigger after content update


    return (
        <div style={{ width: scrollWidth, height: scrollHeight, overflow: 'hidden', border: '1px solid black' }}>
            <div style={{
                width: baseWidth,
                height: baseHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
            }}>
                <ScrollView
                    scrollContainerStyle={scrollContainerStyle}
                    scrollingTextStyle={scrollingTextStyle}
                    currentFont={currentFont}
                    fontBold={fontBold}
                    isRTL={isRTL}
                    fontColor={fontColor}
                    allContent={allContent}
                    currentStoryNumber={currentStoryNumber}
                    crossedLines={crossedLines}
                    storyLines={storyLines}
                    slugs={slugs}
                    newsReaderText={newsReaderText}
                    showClock={showClock}
                    startPosition={startPosition}
                    contentRefs={contentRefs}
                    textRef={textRef}
                    scrollContainerRef={scrollContainerRef} // 👈 new prop
                />
            </div>
        </div>
    );
};

export default Scroll;
