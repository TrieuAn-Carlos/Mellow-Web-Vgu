import React from "react";

const Note: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "418px",
        height: "741px",
        left: "82.32px",
        top: "754.79px",
        background: "#FAF3E8",
        borderRadius: "19px",
        transform: "rotate(-12.25deg)",
        padding: "20px", // Added padding for content
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)", // Added subtle shadow
      }}
    >
      <h2 className="text-lg font-bold mb-2">Today</h2>
      <ul>
        <li className="mb-1">German for 30 minutes</li>
        <li className="mb-1">Review for Business Admin</li>
        <li className="mb-1">Meeting with team at 3pm</li>
      </ul>
    </div>
  );
};

export default Note;
