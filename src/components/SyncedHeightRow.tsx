"use client";

import React, { useEffect, useRef, useState } from "react";

interface SyncedHeightRowProps {
   className?: string;
   reference: React.ReactNode;
   children: React.ReactNode;
}

export default function SyncedHeightRow({ className, reference, children }: SyncedHeightRowProps) {
   const referenceRef = useRef<HTMLDivElement>(null);
   const [height, setHeight] = useState<number | null>(null);

   useEffect(() => {
      const node = referenceRef.current;
      if (!node) return;

      const updateHeight = () => {
         setHeight(window.innerWidth >= 1024 ? node.getBoundingClientRect().height : null);
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);

      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined") {
         observer = new ResizeObserver(updateHeight);
         observer.observe(node);
      }

      return () => {
         window.removeEventListener("resize", updateHeight);
         observer?.disconnect();
      };
   }, []);

   return (
      <div className={className}>
         {React.Children.map(children, (child) => (
            <div className="lg:overflow-hidden" style={height !== null ? { height } : undefined}>
               {child}
            </div>
         ))}
         <div ref={referenceRef} className="self-start">{reference}</div>
      </div>
   );
}
