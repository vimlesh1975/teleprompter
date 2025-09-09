import React, { useEffect, useState } from 'react'

const GraphicsAndVideo = ({ slugs, currentStoryNumber, content, currentSlug }) => {
  const [useAutoPlay, setuseAutoPlay] = useState(false)
  const [videoChannel2, setVideoChannel2] = useState(false)
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
      command: `play ${videoChannel2 ? 2 : 1}-0 express_loop loop`,
    });

    endpoint({
      action: "endpoint",
      command: `play ${videoChannel2 ? 2 : 1}-1 tr wipe 10 left`,
    });

    endpoint({
      action: "endpoint",
      command: `mixer ${videoChannel2 ? 2 : 1}-1 fill 0.238487 0.049438 0.710526 0.705618`,
    });

    endpoint({
      action: "endpoint",
      command: `stop ${videoChannel2 ? 2 : 1}-96`,
    });
    setTimeout(() => {
      console.log(slugs[currentStoryNumber - 1])
      endpoint({
        action: "endpoint",
        command: `play ${videoChannel2 ? 2 : 1}-1 "${slugs[currentStoryNumber - 1]?.media1}" loop wipe 10 left`,
      });
      var data = (slugs[currentStoryNumber - 1]?.OneLinerText)?.split("$$$$$$")
      if (!data) {
        data = ['']
      }
      let xml = '';
      xml += `<componentData id=\\"${'ccg_f0'}\\"><data id=\\"text\\" value=\\"${data[0] ?? ''}\\" /></componentData>`
      xml += `<componentData id=\\"${'ccg_f1'}\\"><data id=\\"text\\" value=\\"${currentStoryNumber ?? ''}\\" /></componentData>`
      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'oneliner2';
      endpoint({
        action: "endpoint",
        command: `cg ${videoChannel2 ? 2 : 1}-96 add 96 "${templateName}" 1 ${xml}`
      });
    }, 400);
  }

  const stopGraphics = () => {
    endpoint({
      action: "endpoint",
      command: `stop ${1}-96`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${1}-1`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${1}-0`,
    });



    endpoint({
      action: "endpoint",
      command: `stop ${2}-96`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${2}-1`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${2}-0`,
    });

    endpoint({
      action: "endpoint",
      command: `clear ${2}`,
    });
  }

  const sendGraphcsNews = () => {
    let xml = '';
    xml += `<componentData id=\\"${'f0'}\\"><data id=\\"text\\" value=\\"${slugs[currentSlug]?.SlugName}\\" /></componentData>`
    xml += `<componentData id=\\"${'f1'}\\"><data id=\\"text\\" value=\\"${content}\\" /></componentData>`
    xml = `"<templateData>${xml}</templateData>"`
    const templateName = 'graphics_news';
    endpoint({
      action: "endpoint",
      command: `cg ${videoChannel2 ? 2 : 1}-96 add 96 "${templateName}" 1 ${xml}`
    });
  }

  return (
    <div>
      <label>
        {" "}
        <input
          checked={useAutoPlay}
          type="checkbox"
          onChange={() => setuseAutoPlay(val => !val)}
        />{" "}
        <span>Auto Play on Next</span>
      </label>

      <label>
        {" "}
        <input
          checked={videoChannel2}
          type="checkbox"
          onChange={() => {
            setVideoChannel2(val => !val);
            endpoint({
              action: "endpoint",
              command: `play ${videoChannel2 ? 2 : 1}-0 express_loop loop`,
            });
          }}
        />{" "}
        <span>Video on 2nd Channel</span>
      </label>
      <div>
        {(slugs[currentStoryNumber - 1]?.OneLinerText)?.split("$$$$$$")[0]}
      </div>
      <div>
        Video File: {slugs[currentStoryNumber - 1]?.media1}
        <div>
          <button onClick={sendGraphics}>Play</button>
          <button onClick={stopGraphics}>Stop</button>
        </div>
        <div>
          <label>Graphics news</label>
          <button onClick={sendGraphcsNews}>Play Graphics news</button>
        </div>
      </div>
    </div>
  )
}

export default GraphicsAndVideo
