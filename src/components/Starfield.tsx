import { useEffect, useRef } from 'react';

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    // We will generate 3D particles that move towards the screen (warp speed effect)
    const numStars = 600;
    const speed = 2.5;
    
    type Star = { x: number, y: number, z: number, pz: number };
    const stars: Star[] = [];

    const initStar = (s: Star, initZ?: boolean) => {
      s.x = Math.random() * w - w / 2;
      s.y = Math.random() * h - h / 2;
      s.z = initZ ? Math.random() * w : w;
      s.pz = s.z;
    };

    for (let i = 0; i < numStars; i++) {
      const s = { x: 0, y: 0, z: 0, pz: 0 };
      initStar(s, true);
      stars.push(s);
    }

    let animationFrameId: number;

    const render = () => {
      // Clear the canvas with slight opacity for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, w, h);
      
      const cx = w / 2;
      const cy = h / 2;

      ctx.lineWidth = 1.5;

      for (let i = 0; i < numStars; i++) {
        let s = stars[i];
        
        s.pz = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          initStar(s, false);
        }

        // Project 3D to 2D
        // The perspective division: fov / z
        const fov = w;
        
        const px = cx + (s.x / s.pz) * fov;
        const py = cy + (s.y / s.pz) * fov;

        const x = cx + (s.x / s.z) * fov;
        const y = cy + (s.y / s.z) * fov;

        // Draw star trail
        // Opacity fades out based on distance
        const opacity = Math.max(0, 1 - s.z / w);
        ctx.strokeStyle = `rgba(130, 180, 255, ${opacity})`;
        
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70" 
      style={{ zIndex: 0 }}
    />
  );
};
