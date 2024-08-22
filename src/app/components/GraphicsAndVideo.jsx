import React, { useEffect, useState } from 'react'

const GraphicsAndVideo = ({ scriptID, slugs, currentStoryNumber }) => {
  const [useAutoPlay, setuseAutoPlay] = useState(false)
  const endpoint = async (str) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type as JSON
      },
      body: JSON.stringify(str), // Convert the data to JSON format
    };
    fetch("/api/casparcg", requestOptions);
  };

  useEffect(() => {
    if (useAutoPlay) {
      sendGraphics();
    }
  }, [currentStoryNumber])

  const sendGraphics = () => {

    endpoint({
      action: "endpoint",
      command: `play 1-1 tr wipe 10 left`,
    });
    endpoint({
      action: "endpoint",
      command: `stop 1-96`,
    });
    setTimeout(() => {
      endpoint({
        action: "endpoint",
        command: `play 1-1 "newsmediac1/${slugs[currentStoryNumber - 1]?.Media}" wipe 10 left`,
      });
      const data = (slugs[currentStoryNumber - 1]?.OneLinerText)?.split("\n")
      if (data && data[0]) {
        let xml = '';
        xml += `<componentData id=\\"${'ccg_f0'}\\"><data id=\\"text\\" value=\\"${data[0] ?? ''}\\" /></componentData>`
        xml += `<componentData id=\\"${'ccg_f1'}\\"><data id=\\"text\\" value=\\"${currentStoryNumber ?? ''}\\" /></componentData>`
        xml = `"<templateData>${xml}</templateData>"`
        const templateName = 'oneliner2';
        endpoint({
          action: "endpoint",
          command: `cg 1-96 add 96 "${templateName}" 1 ${xml}`
        });
      }
    }, 400);
  }

  const stopGraphics = () => {
    endpoint({
      action: "endpoint",
      command: `stop 1-96`,
    });
    endpoint({
      action: "endpoint",
      command: `stop 1-1`,
    });
  }

  return (
    <div>
      <h5>Graphics And Video</h5>
      <label>
              {" "}
              <input
                checked={useAutoPlay}
                type="checkbox"
                onChange={() => setuseAutoPlay((val) => !val)}
              />{" "}
              <span>Auto Play on Next</span>
            </label>
      {(slugs[currentStoryNumber - 1]?.OneLinerText)?.split("\n").map((val, i) => <div>Line {i + 1} {val}</div>)}
      <div>
        Video File: {scriptID}{slugs[currentStoryNumber - 1]?.Media}
        <div>
          <button onClick={sendGraphics}>Play</button>
          <button onClick={stopGraphics}>Stop</button>

        </div>
      </div>
    </div>
  )
}

export default GraphicsAndVideo
