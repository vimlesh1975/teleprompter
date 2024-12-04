'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home({content}) {
  // const [text, setText] = useState(
  //   `भारत आणि पोलंड यांच्यातल्या घनिष्ट राजनैतिक संबंधांना ७० वर्षे पूर्ण होत  असतांना आपली पोलंड भेट विशेष महत्वाची असेल, असं पंतप्रधान नरेंद्र मोदी यांनी म्हटलं आहे.`
  // );
  const [language, setLanguage] = useState('mr-IN');
  const [name, setName] = useState('mr-IN-Standard-A');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const audioRef = useRef(null);

  // Fetch languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/list-voices');
        if (!response.ok) {
          throw new Error('Failed to fetch languages.');
        }
        const data = await response.json();
        setLanguages(data.languages);
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleSpeak = async () => {
    if (!content.trim()) {
      // alert('Please enter some text!');
      return;
    }
    setLoading(true);
    setAudioUrl('');
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text:content, languageCode: language, name }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      alert('Failed to generate speech.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  return (
    <div style={{ padding: '20px' }}>
      {/* <h1>Text-to-Speech</h1> */}

      {/* <textarea
        rows="10"
        cols="50"
        placeholder="Enter text to speak..."
        value={content}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: '10px' }}
      /> */}

      {/* Language Selector Section */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="language-select">Language:</label>
        <select
          id="language-select"
          value={name}
          onChange={(e) => {
            const selectedVoice = languages.find((lang) => lang.name === e.target.value);
            setLanguage(selectedVoice.code);
            setName(selectedVoice.name);
            setAudioUrl('');
          }}
          style={{ marginLeft: '10px' }}
        >
          {languagesLoading ? (
            <option>Loading languages...</option>
          ) : (
            languages.map((lang, index) => (
              <option key={index} value={lang.name}>
                {`${lang.name} (${lang.ssmlGender}, ${lang.code})`}
              </option>
            ))
          )}
        </select>


      </div>

      {/* Auto Play Option */}
      <label htmlFor="autoPlay">
        <input
          type="checkbox"
          id="autoPlay"
          checked={autoPlay}
          onChange={() => setAutoPlay((val) => !val)}
        />
        Auto Play
      </label>

      {/* Speak Button */}
      <button onClick={handleSpeak} style={{ padding: '10px 20px' }} disabled={loading}>
        {loading ? 'Loading...' : 'Speak'}
      </button>
      Speed: {playbackSpeed.toFixed(1)}x
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={playbackSpeed}
        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
        style={{ width: 100 }}
      />

      {/* Audio Player and Controls */}
      {audioUrl && (
        <div style={{ marginTop: 20 }}>
          <audio style={{ width: 300, height: 30 }}
            controls
            src={audioUrl}
            autoPlay={autoPlay}
            ref={audioRef}
          ></audio>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = audioUrl;
              a.download = 'speech.mp3';
              a.click();
            }}
          >
            Download
          </button>

        </div>
      )}
    </div>
  );
}
