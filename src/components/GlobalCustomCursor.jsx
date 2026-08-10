import React, { useEffect, useState } from 'react';

export default function GlobalCustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = (e) => {
      setIsClicked(true);
      // Spawn shockwave ripple on click
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-6), newRipple]);
    };

    const handleMouseUp = () => setIsClicked(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Smooth trail lerp loop
  useEffect(() => {
    let animationFrameId;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animateTrail = () => {
      setTrailingPos((prev) => ({
        x: lerp(prev.x, position.x, 0.22),
        y: lerp(prev.y, position.y, 0.22),
      }));
      animationFrameId = requestAnimationFrame(animateTrail);
    };

    animationFrameId = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  // Cleanup old ripples automatically
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Click Shockwave Ripples (Smaller) */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-400 bg-rose-500/10 animate-ping"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: '24px',
            height: '24px',
            animationDuration: '500ms',
          }}
        />
      ))}

      {/* Trailing Minimalist Ring */}
      <div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500 transition-transform duration-150 ease-out ${
          isHovered ? 'scale-150 border-rose-400 bg-rose-500/10' : ''
        } ${isClicked ? 'scale-75 bg-indigo-500/30' : ''}`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isHovered ? '32px' : '20px',
          height: isHovered ? '32px' : '20px',
        }}
      />

      {/* Inner Minimalist Dot */}
      <div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 transition-transform duration-75 ${
          isHovered ? 'scale-[0.2]' : 'scale-100'
        } ${isClicked ? 'scale-50' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '6px',
          height: '6px',
        }}
      />
    </div>
  );
}
