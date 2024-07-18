import React from 'react';

const triangleStyle = {
  width: 0,
  height: 0,
  borderLeft: '20px solid transparent',
  borderRight: '20px solid transparent',
  borderBottom: '40px solid rgb(255, 0, 34)',
  transform: 'rotate(90deg)'
};

const Triangles = () => {
  return (
    <div>
    

      {/* <div className="triangle-equilateral"></div> */}
      <div style={triangleStyle}></div>

   
    </div>
  );
};

export default Triangles;
