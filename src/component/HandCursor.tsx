import React, { useEffect, useState } from "react";

const CrossCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-50 cursor-none">
      {/* Vertical Line */}
      <div
        className="absolute top-0 h-full w-[1px] bg-black pointer-events-none"
        style={{ left: position.x }}
      />
      {/* Horizontal Line */}
      <div
        className="absolute left-0 w-full h-[1px] bg-black pointer-events-none"
        style={{ top: position.y }}
      />

      {/* Custom Cursor */}
      <div
        className="absolute text-3xl pointer-events-none select-none"
        style={{
          left: position.x - 20,
          top: position.y - 20,
        }}
      >
        {isClicked ? "🫳" : "🤚"}
      </div>
    </div>
  );
};

export default CrossCursor;
