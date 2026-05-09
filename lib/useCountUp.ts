import { useState, useEffect, useRef } from 'react';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target);
  const animRef = useRef<number>(0);
  const prevTargetRef = useRef(target);
  const fromRef = useRef(target);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    fromRef.current = prevTargetRef.current;
    prevTargetRef.current = target;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      setDisplayed(Math.round(fromRef.current + (target - fromRef.current) * easeOut(t)));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [target, duration]);

  return displayed;
}
