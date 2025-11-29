import React from 'react';

export default function Dice3D({ value, isRolling }) {
  // Mapping titik dadu
  const dots = {
    1: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>],
    2: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-2 left-2"></div>, <div key="2" className="bg-black w-3 h-3 rounded-full absolute bottom-2 right-2"></div>],
    3: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-2 left-2"></div>, <div key="2" className="bg-black w-3 h-3 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>, <div key="3" className="bg-black w-3 h-3 rounded-full absolute bottom-2 right-2"></div>],
    4: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-2 left-2"></div>, <div key="2" className="bg-black w-3 h-3 rounded-full absolute top-2 right-2"></div>, <div key="3" className="bg-black w-3 h-3 rounded-full absolute bottom-2 left-2"></div>, <div key="4" className="bg-black w-3 h-3 rounded-full absolute bottom-2 right-2"></div>],
    5: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-2 left-2"></div>, <div key="2" className="bg-black w-3 h-3 rounded-full absolute top-2 right-2"></div>, <div key="3" className="bg-black w-3 h-3 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>, <div key="4" className="bg-black w-3 h-3 rounded-full absolute bottom-2 left-2"></div>, <div key="5" className="bg-black w-3 h-3 rounded-full absolute bottom-2 right-2"></div>],
    6: [<div key="1" className="bg-black w-3 h-3 rounded-full absolute top-2 left-2"></div>, <div key="2" className="bg-black w-3 h-3 rounded-full absolute top-2 right-2"></div>, <div key="3" className="bg-black w-3 h-3 rounded-full absolute top-1/2 left-2 transform -translate-y-1/2"></div>, <div key="4" className="bg-black w-3 h-3 rounded-full absolute top-1/2 right-2 transform -translate-y-1/2"></div>, <div key="5" className="bg-black w-3 h-3 rounded-full absolute bottom-2 left-2"></div>, <div key="6" className="bg-black w-3 h-3 rounded-full absolute bottom-2 right-2"></div>],
  };

  return (
    <div className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-xl shadow-lg relative flex-shrink-0 transition-transform duration-500 ${isRolling ? 'animate-spin' : ''}`}>
      {dots[value || 1]}
    </div>
  );
}