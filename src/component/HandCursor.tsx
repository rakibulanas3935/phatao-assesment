'use client';
import React, { useEffect, useState } from "react";

type Box = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const MIN_BOX_SIZE = 40;

const getRandomColor = () => {
  const colors = [
    "bg-red-300",
    "bg-green-300",
    "bg-blue-300",
    "bg-yellow-300",
    "bg-pink-300",
    "bg-purple-300",
    "bg-cyan-300",
    "bg-orange-300",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const HandCursor: React.FC = () => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDraggingBox, setIsDraggingBox] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingBox, setDrawingBox] = useState<Box | null>(null);
  const [hoverBoxId, setHoverBoxId] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });

      if (isDraggingBox) {
        setBoxes(prev =>
          prev.map(box =>
            box.id === isDraggingBox
              ? {
                  ...box,
                  x: e.clientX - dragOffset.x,
                  y: e.clientY - dragOffset.y,
                }
              : box
          )
        );
      }

      if (drawingBox) {
        const width = Math.max(Math.abs(e.clientX - drawingBox.x), MIN_BOX_SIZE);
        const height = Math.max(Math.abs(e.clientY - drawingBox.y), MIN_BOX_SIZE);

        const newBox = {
          ...drawingBox,
          width,
          height,
          x: Math.min(e.clientX, drawingBox.x),
          y: Math.min(e.clientY, drawingBox.y),
        };
        setDrawingBox(newBox);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isBox = target?.dataset?.boxId;

      if (!isBox) {
        const startX = e.clientX;
        const startY = e.clientY;

        const newBox: Box = {
          id: Date.now().toString(),
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          color: getRandomColor(),
        };

        setDrawingBox(newBox);
      }
    };

    const handleMouseUp = () => {
      if (drawingBox) {
        const finalBox: Box = {
          ...drawingBox,
          width: Math.max(drawingBox.width, MIN_BOX_SIZE),
          height: Math.max(drawingBox.height, MIN_BOX_SIZE),
        };
        setBoxes(prev => [...prev, finalBox]);
        setDrawingBox(null);
      }
      setIsDraggingBox(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drawingBox, isDraggingBox, dragOffset]);

  const handleBoxMouseDown = (e: React.MouseEvent<HTMLDivElement>, box: Box) => {
    e.stopPropagation();
    if (e.button !== 0) return; // only left click
    setIsDraggingBox(box.id);
    setDragOffset({
      x: e.clientX - box.x,
      y: e.clientY - box.y,
    });
  };

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>, box: Box) => {
    e.stopPropagation();

    if (box.width <= MIN_BOX_SIZE * 2 || box.height <= MIN_BOX_SIZE * 2) {
      // Box too small to split properly
      return;
    }

    const halfWidth = box.width / 2;
    const halfHeight = box.height / 2;
    const { x, y, color } = box;

    if (halfWidth < MIN_BOX_SIZE || halfHeight < MIN_BOX_SIZE) {
      return; // safety check
    }

    const newBoxes: Box[] = [
      { id: `${box.id}-1`, x, y, width: halfWidth, height: halfHeight, color },
      { id: `${box.id}-2`, x: x + halfWidth, y, width: halfWidth, height: halfHeight, color },
      { id: `${box.id}-3`, x, y: y + halfHeight, width: halfWidth, height: halfHeight, color },
      { id: `${box.id}-4`, x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight, color },
    ];

    setBoxes(prev => prev.flatMap(b => (b.id === box.id ? newBoxes : [b])));
  };

  return (
    <>
      {/* Crosshair */}
      <div className="fixed top-0 left-0 w-screen h-screen z-50 cursor-none select-none pointer-events-none">
        <div
          className="absolute top-0 h-full w-[1px] bg-black pointer-events-none"
          style={{ left: cursor.x }}
        />
        <div
          className="absolute left-0 w-full h-[1px] bg-black pointer-events-none"
          style={{ top: cursor.y }}
        />
        <div
          className="absolute text-3xl pointer-events-none select-none transition-transform duration-150"
          style={{ left: cursor.x - 20, top: cursor.y - 20 }}
        >
          {drawingBox || isDraggingBox ? "👉" : hoverBoxId ? "➕" : "🤚"}
        </div>
      </div>

      {/* Boxes */}
      {[...boxes, ...(drawingBox ? [drawingBox] : [])].map(box => (
        <div
          key={box.id}
          data-box-id={box.id}
          onMouseDown={e => handleBoxMouseDown(e, box)}
          onClick={e => handleBoxClick(e, box)}
          onMouseEnter={() => setHoverBoxId(box.id)}
          onMouseLeave={() => setHoverBoxId(null)}
          className={`absolute shadow-md ${box.color} transition-all duration-150`}
          style={{
            borderRadius: "0px",
            width: `${box.width}px`,
            height: `${box.height}px`,
            left: `${box.x}px`,
            top: `${box.y}px`,
            cursor: isDraggingBox === box.id ? "grabbing" : "grab",
            touchAction: "none",
          }}
        />
      ))}
    </>
  );
};

export default HandCursor;
