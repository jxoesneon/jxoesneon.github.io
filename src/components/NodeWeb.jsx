import React, { useEffect, useRef, useCallback } from 'react';

// --- INTERACTIVE BACKGROUND COMPONENT ---
class Circle {
  constructor(pos, rad) { this.pos = pos; this.radius = rad; this.active = 0; }
  draw(ctx, theme) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    const colors = {
      'light': `rgba(55, 65, 81, ${this.active})`,
      'dark': `rgba(0, 243, 255, ${this.active})`,
      'toast': `rgba(234, 88, 12, ${this.active * 0.8})`,
      'burnt-toast': `rgba(251, 146, 60, ${this.active * 0.8})`
    };
    ctx.fillStyle = colors[theme] || colors['dark'];
    ctx.fill();
  }
}

const ConnectingDotsBackground = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef();
  const pointsRef = useRef([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const animateHeaderRef = useRef(true);

  const getDistance = (p1, p2) => Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);

  const drawLines = useCallback((p, ctx) => {
    if (!p.active) return;
    const lineColors = {
      'light': `rgba(107, 114, 128, ${p.active})`,
      'dark': `rgba(188, 19, 254, ${p.active})`,
      'toast': `rgba(234, 88, 12, ${p.active})`,
      'burnt-toast': `rgba(251, 146, 60, ${p.active})`
    };
    for (const i in p.closest) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.closest[i].x, p.closest[i].y);
      ctx.strokeStyle = lineColors[theme] || lineColors['dark'];
      ctx.stroke();
    }
  }, [theme]);

  const shiftPoint = useCallback((p) => {
    const duration = 1 + Math.random();
    const targetX = p.originX - 50 + Math.random() * 100;
    const targetY = p.originY - 50 + Math.random() * 100;
    const startX = p.x;
    const startY = p.y;
    let startTime = null;

    const easeInOutCirc = (t) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

    const animatePoint = (time) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / (duration * 1000);
      if (progress < 1) {
        p.x = startX + (targetX - startX) * easeInOutCirc(progress);
        p.y = startY + (targetY - startY) * easeInOutCirc(progress);
        requestAnimationFrame(animatePoint);
      } else {
        p.x = targetX;
        p.y = targetY;
        shiftPoint(p);
      }
    };
    requestAnimationFrame(animatePoint);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const i in pointsRef.current) {
      const p = pointsRef.current[i];
      const dist = getDistance(targetRef.current, p);
      if (dist < 4000) { p.active = 0.3; p.circle.active = 0.6; }
      else if (dist < 20000) { p.active = 0.1; p.circle.active = 0.3; }
      else if (dist < 40000) { p.active = 0.02; p.circle.active = 0.1; }
      else { p.active = 0; p.circle.active = 0; }
      drawLines(p, ctx);
      p.circle.draw(ctx, theme);
    }
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawLines, theme]);

  const initHeader = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    targetRef.current = { x: width / 2, y: height / 2 };
    canvas.width = width;
    canvas.height = height;

    const newPoints = [];
    for (let x = 0; x < width; x = x + width / 20) {
      for (let y = 0; y < height; y = y + height / 20) {
        const px = x + Math.random() * width / 20;
        const py = y + Math.random() * height / 20;
        const p = { x: px, originX: px, y: py, originY: py, closest: [] };
        newPoints.push(p);
      }
    }
    for (let i = 0; i < newPoints.length; i++) {
      const closest = [];
      const p1 = newPoints[i];
      for (let j = 0; j < newPoints.length; j++) {
        const p2 = newPoints[j];
        if (p1 !== p2) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed) { if (closest[k] === undefined || getDistance(p1, p2) < getDistance(p1, closest[k])) { closest[k] = p2; placed = true; } }
          }
        }
      }
      p1.closest = closest;
      p1.circle = new Circle(p1, 2 + Math.random() * 2);
    }
    pointsRef.current = newPoints;
    pointsRef.current.forEach(shiftPoint);
  }, [shiftPoint]);

  useEffect(() => {
    initHeader();
    animationFrameId.current = requestAnimationFrame(animate);

    const handleMouseMove = (e) => { targetRef.current = { x: e.clientX, y: e.clientY }; };
    const handleResize = () => initHeader();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [initHeader, animate]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full block z-0 pointer-events-none" />;
};

export default ConnectingDotsBackground;
