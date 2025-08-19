import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client';
import ScrollView from './ScrollView';

const ScrollViewforcasparcg = () => {
    const [currentFont, setCurrentFont] = useState("Times New Roman");
    const [isRTL, setIsRTL] = useState(false);
    const [fontColor, setFontColor] = useState('#ffffff');
    const [fontBold, setFontBold] = useState(false);
    const [crossedLines, setCrossedLines] = useState(0);
    const [storyLines, setStoryLines] = useState([]);
    const [currentStoryNumber, setCurrentStoryNumber] = useState(1);
    const [allContent, setAllContent] = useState([]);
    const [startPosition, setStartPosition] = useState(308);
    const [newsReaderText, setNewsReaderText] = useState('Continue..');
    const [showClock, setShowClock] = useState(true);
    const [scrollContainerStyle, setScrollContainerStyle] = useState({});
    const [scrollingTextStyle, setScrollingTextStyle] = useState({});
    const [slugs, setSlugs] = useState(0);
    const [speed, setSpeed] = useState(0);


    const socketRef = useRef(null);


    const textRef = useRef(null);
    const contentRefs = useRef([]);

    useEffect(() => {
        if (socketRef.current) return; // 🛑 Prevent duplicate connection
        socketRef.current = io();



        socketRef.current.on("crossedLines2", (data) => {
            setCrossedLines(data);
        });
        socketRef.current.on("storyLines2", (data) => {
            setStoryLines(data);
        });

        socketRef.current.on("setCurrentStoryNumber2", (data) => {
            setCurrentStoryNumber(data);
        })

        socketRef.current.on("allContent2", (data) => {
            setAllContent(data);
        })

        socketRef.current.on("setSlugs2", (data) => {
            setSlugs(data);
        })

        socketRef.current.on("setStartPosition2", (data) => {
            setStartPosition(data);
        });

        socketRef.current.on("setShowClock2", (data) => {
            setShowClock(data);
        });
        socketRef.current.on("setNewsReaderText2", (data) => {
            setNewsReaderText(data);
        });

        socketRef.current.on("rtl2", (data) => {
            setIsRTL(data);
        });

        socketRef.current.on("fontColor2", (data) => {
            setFontColor(data);
        });
        socketRef.current.on("fontBold2", (data) => {
            setFontBold(data);
        });
        socketRef.current.on("currentFont2", (data) => {
            setCurrentFont(data);
        });
        socketRef.current.on("scrollContainerStyle2", (data) => {
            setScrollContainerStyle(data);
        });

        socketRef.current.on("scrollingTextStyle2", (data) => {
            setScrollingTextStyle(data);
        });

        socketRef.current.on("speed2", (data) => {
            setSpeed(data);
        });

        socketRef.current.on('connect', function () {
            const socket = socketRef.current;
            console.log('SOCKET CONNECTED! from Scrollviewforcasparcg page', socket?.id ?? 'no id yet');
            socketRef.current.emit("casparready", screen.colorDepth);

        });




        return () => {
            // socketRef.current.off("crossedLines2");
            // socketRef.current.off("storyLines2");
            // socketRef.current.off("setCurrentStoryNumber2");
            // socketRef.current.off("allContent2");
            // socketRef.current.off("setSlugs2");
            // socketRef.current.off("setStartPosition2");
            // socketRef.current.off("rtl2");
            // socketRef.current.off("rbgColor2tl2");
            // socketRef.current.off("fontColor2");
            // socketRef.current.off("fontBold2");
            // socketRef.current.off("currentFont2");
            // socketRef.current.off("scrollContainerStyle2");
            // socketRef.current.off("scrollingTextStyle2");
            // socketRef.current.off("speed2");

            // socketRef.current = null;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (<div style={{
        marginTop: -8,
        marginLeft: -8,
    }} >
        <ScrollView scrollContainerStyle={scrollContainerStyle} scrollingTextStyle={scrollingTextStyle} currentFont={currentFont} fontBold={fontBold} isRTL={isRTL} fontColor={fontColor} allContent={allContent} currentStoryNumber={currentStoryNumber} crossedLines={crossedLines} storyLines={storyLines} slugs={slugs} newsReaderText={newsReaderText} showClock={showClock} startPosition={startPosition} contentRefs={contentRefs} textRef={textRef} speed={speed} />
    </div>
    )
}
export default ScrollViewforcasparcg