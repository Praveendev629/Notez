import { useEffect, useRef, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

/**
 * CropModal lets the user pick a rectangular region of an image and returns the
 * cropped result as a data URL. The region can be moved (drag inside) and
 * resized (drag the bottom-right handle).
 */
export default function CropModal({ image, onCancel, onApply }) {
  const imgRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 }); // displayed size
  const [box, setBox] = useState(null); // {x,y,w,h} in displayed px
  const dragRef = useRef(null);

  const fitSize = (natW, natH) => {
    const maxW = 620;
    const maxH = 460;
    const ratio = Math.min(maxW / natW, maxH / natH, 1);
    return { w: Math.round(natW * ratio), h: Math.round(natH * ratio) };
  };

  const handleLoad = () => {
    const img = imgRef.current;
    const s = fitSize(img.naturalWidth, img.naturalHeight);
    setSize(s);
    setBox({ x: 0, y: 0, w: s.w, h: s.h });
  };

  // pointer helper — coordinates relative to the image box
  const rel = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onPointerDown = (e) => {
    const p = rel(e);
    const inHandle =
      box &&
      p.x > box.x + box.w - 18 &&
      p.y > box.y + box.h - 18 &&
      p.x < box.x + box.w + 18 &&
      p.y < box.y + box.h + 18;
    const inBox = box && p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;

    if (inHandle) {
      dragRef.current = { mode: 'resize', start: p, orig: { ...box } };
    } else if (inBox) {
      dragRef.current = { mode: 'move', start: p, orig: { ...box } };
    } else {
      dragRef.current = { mode: 'draw', start: p, orig: null };
      setBox({ x: p.x, y: p.y, w: 0, h: 0 });
    }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const p = rel(e);
    if (d.mode === 'draw') {
      const x = clamp(Math.min(d.start.x, p.x), 0, size.w);
      const y = clamp(Math.min(d.start.y, p.y), 0, size.h);
      const w = clamp(Math.abs(p.x - d.start.x), 0, size.w - x);
      const h = clamp(Math.abs(p.y - d.start.y), 0, size.h - y);
      setBox({ x, y, w, h });
    } else if (d.mode === 'move') {
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      setBox({
        x: clamp(d.orig.x + dx, 0, size.w - d.orig.w),
        y: clamp(d.orig.y + dy, 0, size.h - d.orig.h),
        w: d.orig.w,
        h: d.orig.h,
      });
    } else if (d.mode === 'resize') {
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      const w = clamp(d.orig.w + dx, 30, size.w - d.orig.x);
      const h = clamp(d.orig.h + dy, 30, size.h - d.orig.y);
      setBox({ x: d.orig.x, y: d.orig.y, w, h });
    }
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  useEffect(() => {
    const up = () => stopDrag();
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  const apply = () => {
    const img = imgRef.current;
    if (!img || !box || box.w < 5 || box.h < 5) return;
    const scaleX = img.naturalWidth / size.w;
    const scaleY = img.naturalHeight / size.h;
    const sx = Math.round(box.x * scaleX);
    const sy = Math.round(box.y * scaleY);
    const sw = Math.round(box.w * scaleX);
    const sh = Math.round(box.h * scaleY);
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onApply(dataUrl);
  };

  const reset = () => {
    if (!imgRef.current) return;
    const s = fitSize(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    setSize(s);
    setBox({ x: 0, y: 0, w: s.w, h: s.h });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl animate-pop dark:border-neutral-700 dark:bg-neutral-800">
        <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Crop image</h3>

        <div
          className="relative mx-auto select-none overflow-hidden rounded-lg bg-[#10131c]"
          style={{ width: size.w || '100%', height: size.h || 300, touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <img
            ref={imgRef}
            src={image}
            onLoad={handleLoad}
            alt="To crop"
            draggable={false}
            style={{ width: size.w || '100%', height: size.h || 'auto' }}
            className="block select-none"
          />

          {box && (
            <>
              <div
                className="absolute border-2 border-brand-500 bg-brand-500/10"
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              />
              {/* resize handle */}
              <div
                className="absolute flex h-5 w-5 items-center justify-center rounded bg-brand-500 text-white"
                style={{ left: box.x + box.w - 10, top: box.y + box.h - 10, cursor: 'nwse-resize' }}
              >
                <span className="text-[9px] font-bold">◢</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={reset} className="btn-ghost text-xs">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={apply} className="btn-primary">
              <Check className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}