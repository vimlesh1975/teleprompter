import React, { useEffect } from 'react'

const GraphicsAndVideo = ({ scriptID, slugs, currentStoryNumber }) => {
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
    sendGraphics();
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

  return (
    <div>
      <h5>Graphics And Video</h5>
      {(slugs[currentStoryNumber - 1]?.OneLinerText)?.split("\n").map((val, i) => <div>Line {i+1} {val}</div>)}
      <div>
       Video File: {scriptID}{slugs[currentStoryNumber - 1]?.Media}
       <div>
       <button onClick={sendGraphics}>Play</button>

       </div>
      </div>
    </div>
  )
}

export default GraphicsAndVideo
