import { useEffect, useRef } from "react";

export default function DynamicMotionBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const darkColors = [
      "rgba(59, 130, 246, 0.25)", // Bright Blue
      "rgba(16, 185, 129, 0.25)", // Bright Emerald
      "rgba(236, 72, 153, 0.25)", // Bright Pink
      "rgba(168, 85, 247, 0.25)", // Bright Purple
    ];

    const lightColors = [
      "rgba(59, 130, 246, 0.1)",
      "rgba(16, 185, 129, 0.1)",
      "rgba(249, 115, 22, 0.1)",
      "rgba(168, 85, 247, 0.1)",
    ];

    const SHAPE_COUNT = 16;
    const GRAIN_COUNT = 800;
    const shapes = [];
    const grains = [];

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setSize();
    window.addEventListener("resize", setSize);

    class Shape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 150 + 100;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.darkColor = darkColors[Math.floor(Math.random() * darkColors.length)];
        this.lightColor = lightColors[Math.floor(Math.random() * lightColors.length)];
        this.type = Math.floor(Math.random() * 3); // 0: circle, 1: square, 2: triangle
        this.rotation = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vr;
        if (this.x < -300) this.x = canvas.width + 300;
        if (this.x > canvas.width + 300) this.x = -300;
        if (this.y < -300) this.y = canvas.height + 300;
        if (this.y > canvas.height + 300) this.y = -300;
      }

      draw(isDark) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        const color = isDark ? this.darkColor : this.lightColor;
        ctx.fillStyle = color;

        if (isDark) {
          ctx.shadowBlur = 45;
          ctx.shadowColor = color;
        }

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

    // High density grain particles
    for (let i = 0; i < GRAIN_COUNT; i++) {
      grains.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    for (let i = 0; i < SHAPE_COUNT; i++) shapes.push(new Shape());

    const render = () => {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render glowing floating shapes
      shapes.forEach((s) => {
        s.update();
        s.draw(isDark);
      });

      // Render 800 grains (white in dark mode, dark gray in light mode)
      const grainColorVal = isDark ? 255 : 30;
      grains.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < 0) g.x = canvas.width;
        if (g.x > canvas.width) g.x = 0;
        if (g.y < 0) g.y = canvas.height;
        if (g.y > canvas.height) g.y = 0;

        g.alpha += g.twinkleSpeed;
        if (g.alpha > 0.95 || g.alpha < 0.1) g.twinkleSpeed *= -1;

        ctx.fillStyle = `rgba(${grainColorVal}, ${grainColorVal}, ${grainColorVal}, ${Math.max(0.08, g.alpha)})`;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
        ctx.fill();
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
