import React, { useEffect, useRef } from 'react';

export default function MathCurveLoader({ size = 48, className = "" }) {
  const pathRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const totalPoints = 180;
    const config = {
      baseRadius: 7,
      detailAmplitude: 3,
      petalCount: 7,
      curveScale: 3.8
    };

    const getPoint = (progress, detailScale) => {
      const t = progress * Math.PI * 2;
      const x = config.baseRadius * Math.cos(t) - config.detailAmplitude * detailScale * Math.cos(config.petalCount * t);
      const y = config.baseRadius * Math.sin(t) - config.detailAmplitude * detailScale * Math.sin(config.petalCount * t);
      return {
        x: 50 + x * config.curveScale,
        y: 50 + y * config.curveScale
      };
    };

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const loopProgress = (elapsed % 4000) / 4000;
      const pulseProgress = (elapsed % 3600) / 3600;
      const rotationProgress = (elapsed % 24000) / 24000;

      const detailScale = (Math.sin(pulseProgress * Math.PI * 2) + 1) / 2;
      const rotationDeg = rotationProgress * 360;

      const pathData = [];
      const numParticles = 60;
      const trailSpan = 0.38;

      for (let i = 0; i < numParticles; i++) {
        const fraction = i / (numParticles - 1);
        const particleProgress = (loopProgress - (1 - fraction) * trailSpan + 1) % 1;
        const pt = getPoint(particleProgress, detailScale);

        if (i === 0) {
          pathData.push(`M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
        } else {
          pathData.push(`L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
        }
      }

      if (pathRef.current) {
        pathRef.current.setAttribute("d", pathData.join(" "));
        pathRef.current.setAttribute("transform", `rotate(${rotationDeg.toFixed(2)} 50 50)`);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="math-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        fill="none"
        stroke="url(#math-loader-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
