'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TourDefinition, resolveHref } from './tour-steps';

type OnboardingTourProps = {
   definition: TourDefinition;
   pathname: string;
   open: boolean;
   onClose: () => void;
};

type Rect = { top: number; left: number; width: number; height: number };

const TOOLTIP_WIDTH = 320;
const MAX_FIND_ATTEMPTS = 20; // ~20 * 150ms = 3s — covers async data loading (e.g. episode page)
const FIND_INTERVAL_MS = 150;
const SCROLL_SETTLE_MS = 380;

function measure(el: Element): Rect {
   const r = el.getBoundingClientRect();
   return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function OnboardingTour({ definition, pathname, open, onClose }: OnboardingTourProps) {
   const router = useRouter();
   const { steps, related } = definition;
   const [stepIndex, setStepIndex] = useState(0);
   const [rect, setRect] = useState<Rect | null>(null);
   const [tooltipHeight, setTooltipHeight] = useState(160);
   const tooltipRef = useRef<HTMLDivElement>(null);

   // Reset to the first step whenever the tour (re)opens.
   useEffect(() => {
      if (!open) return;
      setStepIndex(0);
      setRect(null);
   }, [open]);

   // Locate the current step's target, waiting for it to appear (async data),
   // scroll it into view, then measure it. Skips steps whose target never shows up.
   useEffect(() => {
      if (!open) return;

      const step = steps[stepIndex];
      if (!step) {
         onClose();
         return;
      }

      let cancelled = false;
      let found = false;
      let attempts = 0;
      let pollId: ReturnType<typeof setInterval> | null = null;
      let scrollTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const finalizeMeasure = (el: Element) => {
         if (!cancelled) setRect(measure(el));
      };

      const tryFind = () => {
         if (cancelled || found) return;
         const el = document.querySelector(step.targetSelector);
         if (el) {
            found = true;
            if (pollId) {
               clearInterval(pollId);
               pollId = null;
            }
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            scrollTimeoutId = setTimeout(() => finalizeMeasure(el), SCROLL_SETTLE_MS);
            return;
         }
         attempts++;
         if (attempts >= MAX_FIND_ATTEMPTS) {
            if (pollId) {
               clearInterval(pollId);
               pollId = null;
            }
            if (!cancelled) {
               if (stepIndex < steps.length - 1) {
                  setStepIndex((i) => i + 1);
               } else {
                  onClose();
               }
            }
         }
      };

      setRect(null);
      tryFind();
      if (!found && !cancelled) {
         pollId = setInterval(tryFind, FIND_INTERVAL_MS);
      }

      const onRecalc = () => {
         const el = document.querySelector(step.targetSelector);
         if (el) finalizeMeasure(el);
      };
      window.addEventListener('resize', onRecalc);
      window.addEventListener('scroll', onRecalc, true);

      return () => {
         cancelled = true;
         if (pollId) clearInterval(pollId);
         if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
         window.removeEventListener('resize', onRecalc);
         window.removeEventListener('scroll', onRecalc, true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [open, stepIndex, steps]);

   // Track the tooltip's real (content-dependent) height so the placement math below can clamp
   // against it directly, instead of guessing. Settles after one extra render when content changes.
   useLayoutEffect(() => {
      const h = tooltipRef.current?.offsetHeight;
      if (h && h !== tooltipHeight) setTooltipHeight(h);
   });

   if (!open || !rect) return null;

   const step = steps[stepIndex];
   const isLast = stepIndex === steps.length - 1;

   // Targets taller than the viewport (long lists/grids, after scrollIntoView block:'center') can put
   // rect.top/bottom far outside the visible area. Computing top/left directly (rather than via a
   // translateY transform anchored to a possibly off-screen edge) lets us clamp the tooltip fully
   // inside the viewport in every case, pinning it near the top of the screen when it would overflow.
   const tooltipStyle: React.CSSProperties = (() => {
      const gap = 12;
      let top: number;
      let left: number;

      switch (step.placement) {
         case 'right':
            top = rect.top;
            left = rect.left + rect.width + gap;
            break;
         case 'top':
            top = rect.top - gap - tooltipHeight;
            left = rect.left;
            break;
         case 'bottom':
         default:
            top = rect.top + rect.height + gap;
            left = rect.left;
            break;
      }

      const margin = 8;
      const maxTop = Math.max(margin, window.innerHeight - tooltipHeight - margin);
      const maxLeft = Math.max(margin, window.innerWidth - TOOLTIP_WIDTH - margin);
      top = Math.min(Math.max(top, margin), maxTop);
      left = Math.min(Math.max(left, margin), maxLeft);

      return { top, left };
   })();

   const goTo = (href: string) => {
      onClose();
      router.push(href);
   };

   return (
      <div className="fixed inset-0 z-[60]">
         <div className="absolute inset-0 bg-black/50" />
         <div
            className="absolute rounded-md ring-2 ring-[#d43c4a] pointer-events-none transition-all duration-150"
            style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
         />
         <div
            ref={tooltipRef}
            className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 z-[61]"
            style={{ width: TOOLTIP_WIDTH, ...tooltipStyle }}
         >
            <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
            <div className="text-xs text-gray-300 mb-3 leading-relaxed">{step.body}</div>

            {isLast && related && related.length > 0 && (
               <div className="mb-3 pt-3 border-t border-gray-700">
                  <div className="text-[11px] text-gray-400 mb-2">Pokračovať prehliadkou:</div>
                  <div className="flex flex-col gap-1.5">
                     {related.map((link) => (
                        <button
                           key={link.label}
                           onClick={() => goTo(resolveHref(link.href, pathname))}
                           className="w-full text-left px-2.5 py-1.5 text-xs rounded bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white transition"
                        >
                           {link.label} →
                        </button>
                     ))}
                  </div>
               </div>
            )}

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
