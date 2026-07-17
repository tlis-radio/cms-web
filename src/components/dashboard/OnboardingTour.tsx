'use client';

import { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TourStep } from './tour-steps';

type OnboardingTourProps = {
   steps: TourStep[];
   open: boolean;
   onClose: () => void;
};

type Rect = { top: number; left: number; width: number; height: number };

export default function OnboardingTour({ steps, open, onClose }: OnboardingTourProps) {
   const [stepIndex, setStepIndex] = useState(0);
   const [rect, setRect] = useState<Rect | null>(null);

   const measure = useCallback((selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
   }, []);

   // Find the next step (forward or backward) whose target actually exists.
   useEffect(() => {
      if (!open) return;
      setStepIndex(0);
   }, [open]);

   useEffect(() => {
      if (!open) return;

      const step = steps[stepIndex];
      if (!step) {
         onClose();
         return;
      }

      const found = measure(step.targetSelector);
      if (!found) {
         // Skip steps whose target isn't present on the current page.
         if (stepIndex < steps.length - 1) {
            setStepIndex((i) => i + 1);
         } else {
            onClose();
         }
         return;
      }
      setRect(found);

      const onRecalc = () => setRect(measure(step.targetSelector));
      window.addEventListener('resize', onRecalc);
      window.addEventListener('scroll', onRecalc, true);
      return () => {
         window.removeEventListener('resize', onRecalc);
         window.removeEventListener('scroll', onRecalc, true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [open, stepIndex, steps]);

   useEffect(() => {
      if (!open) return;
      document.body.style.overflow = 'hidden';
      return () => {
         document.body.style.overflow = '';
      };
   }, [open]);

   if (!open || !rect) return null;

   const step = steps[stepIndex];
   const isLast = stepIndex === steps.length - 1;

   const tooltipStyle: React.CSSProperties = (() => {
      const gap = 12;
      switch (step.placement) {
         case 'right':
            return { top: rect.top, left: rect.left + rect.width + gap };
         case 'top':
            return { top: Math.max(rect.top - gap, 8), left: rect.left, transform: 'translateY(-100%)' };
         case 'bottom':
         default:
            return { top: rect.top + rect.height + gap, left: rect.left };
      }
   })();

   return (
      <div className="fixed inset-0 z-[60]">
         <div className="absolute inset-0 bg-black/50" />
         <div
            className="absolute rounded-md ring-2 ring-[#d43c4a] pointer-events-none transition-all duration-150"
            style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
         />
         <div
            className="absolute w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 z-[61]"
            style={tooltipStyle}
         >
            <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
            <div className="text-xs text-gray-300 mb-3 leading-relaxed">{step.body}</div>
            <div className="flex items-center justify-between">
               <button onClick={onClose} className="text-xs text-gray-400 hover:text-white transition">
                  Preskočiť
               </button>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                     disabled={stepIndex === 0}
                     className="px-2.5 py-1.5 text-xs rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 transition"
                  >
                     Späť
                  </button>
                  <button
                     onClick={() => (isLast ? onClose() : setStepIndex((i) => i + 1))}
                     className="px-2.5 py-1.5 text-xs rounded bg-[#d43c4a] hover:bg-[#b83744] text-white transition"
                  >
                     {isLast ? 'Dokončiť' : 'Ďalej'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
