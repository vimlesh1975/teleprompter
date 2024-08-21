import React from 'react'

const GraphicsAndVideo = ({scriptID, slugs, currentStoryNumber}) => {
  return (
    <div>
        <h5>Graphics And Video</h5>
      {currentStoryNumber}

      <div>
      {scriptID}{slugs[currentStoryNumber-1]?.Media}
      </div>
    </div>
  )
}

export default GraphicsAndVideo
