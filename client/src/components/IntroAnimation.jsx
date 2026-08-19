import { useEffect, useRef, useState } from 'react';
import { LogoMark, LogoText } from './Logo';

/**
 * A smooth brand intro that animates the logo MARK and the "Notez" TEXT
 * as two separate elements:
 *   1. the mark scales/fades in with a soft glow,
 *   2. the wordmark slides and fades in below it,
 *   3. the whole emblem lifts and dissolves away to reveal the app.
 * Respects prefers-reduced-motion (jumps straight to the reveal).
 */
export default function IntroAnimation({ onDone }) {
  const [stage, setStage] = useState(0); // 0=mark, 1=text, 2=exit
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setStage(1), 900);
    const t2 = setTimeout(() => setStage(2), 1900);
    const t3 = setTimeout(() => {
      setExiting(true);
      onDone();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced, onDone]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0c0e16]"
      aria-hidden="true"
    >
      {/* soft ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(228,30,38,0.28) 0%, rgba(228,30,38,0) 70%)',
          opacity: stage >= 1 ? 1 : 0.4,
          transition: 'opacity 1.2s ease',
          transform: `translate(-50%, -50%) scale(${exiting ? 1.3 : 1})`,
        }}
      />

      <div
        className="relative flex flex-col items-center"
        style={{
          transform: exiting ? 'scale(0.94)' : 'scale(1)',
          opacity: exiting ? 0 : 1,
          transition: 'transform .5s ease, opacity .5s ease',
        }}
      >
        {/* Mark */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: stage >= 1 ? 0.98 : stage === 0 ? 1 : 0,
            transform:
              stage === 0
                ? 'scale(0.6)'
                : stage === 1
                ? 'scale(1)'
                : 'scale(1.04)',
            filter: exiting ? 'blur(6px)' : 'blur(0px)',
          }}
        >
          <LogoMark size={150} />
        </div>

        {/* Text */}
        <div
          className="mt-6"
          style={{
            opacity: stage >= 1 && !exiting ? 1 : 0,
            transform:
              stage === 0
                ? 'translateY(24px)'
                : exiting
                ? 'translateY(8px)'
                : 'translateY(0)',
            transition: 'opacity .6s ease, transform .6s ease',
          }}
        >
          <LogoText size={330} />
        </div>
      </div>
    </div>
  );
}