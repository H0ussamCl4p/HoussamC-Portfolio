"use client";
import React, { useEffect, useRef } from 'react';

const cursorStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#0096ff', // solid blue, homogeneous
  pointerEvents: 'none',
  transform: 'translate(-50%, -50%)',
  zIndex: 2147483647,
  transition: 'background 0.2s',
  willChange: 'transform',
};


const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

const MouseFollower = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    // Set initial position to center of window (client only)
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    pos.current.x = window.innerWidth / 2;
    pos.current.y = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      scaleRef.current = 0.7;
      if (cursorRef.current) {
        cursorRef.current.style.transition = 'transform 0.1s cubic-bezier(.4,2,.6,1), background 0.2s, border 0.2s';
      }
    };
    const handleMouseUp = () => {
      scaleRef.current = 1;
      if (cursorRef.current) {
        cursorRef.current.style.transition = 'transform 0.3s cubic-bezier(.22,1,.36,1), background 0.2s, border 0.2s';
      }
    };

    const animate = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.18);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.18);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${scaleRef.current})`;
      }
      animFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return <div ref={cursorRef} style={cursorStyle} />;
};

export default MouseFollower;
