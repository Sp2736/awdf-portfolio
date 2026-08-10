import React, { useEffect, useRef } from "react";

export default function DarkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const shapes: Shape[] = [];
    const SHAPE_COUNT = 15;

    // Increased opacity from 0.05 to 0.25 so the colors are very visible and distinct
    const colors = [
      "rgba(59, 130, 246, 0.25)", // Bright Blue
      "rgba(16, 185, 129, 0.25)", // Bright Emerald
      "rgba(236, 72, 153, 0.25)", // Bright Pink
      "rgba(168, 85, 247, 0.25)", // Bright Purple
    ];

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    class Shape {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      color: string;
      type: number;
      rotation: number;
      vr: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 150 + 100;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.type = Math.floor(Math.random() * 3);
        this.rotation = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vr;
        if (this.x < -300) this.x = canvas!.width + 300;
        if (this.x > canvas!.width + 300) this.x = -300;
        if (this.y < -300) this.y = canvas!.height + 300;
        if (this.y > canvas!.height + 300) this.y = -300;
      }
      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        // Massive glowing aura
        ctx.shadowBlur = 45;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        if (this.type === 0) {
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        } else if (this.type === 1) {
          ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    for (let i = 0; i < SHAPE_COUNT; i++) shapes.push(new Shape());

    const render = () => {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((s) => {
        s.update();
        s.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
}
