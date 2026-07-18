import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

const GAP_PX = 140;
const PIXELS_PER_SECOND = 45;

const Marquee = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return;

    const container = containerRef.current;
    const measureEl = measureRef.current;

    const measure = () => {
      const tw = measureEl.scrollWidth;
      setTextWidth(tw);
      setShouldScroll(tw > container.offsetWidth);
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    resizeObserver.observe(measureEl);
    measure();

    return () => resizeObserver.disconnect();
  }, [text]);

  const duration = textWidth > 0 ? (textWidth + GAP_PX) / PIXELS_PER_SECOND : 0;

  return (
    <div
      ref={containerRef}
      className={classNames("relative overflow-hidden whitespace-nowrap w-full", className)}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className={classNames("absolute invisible pointer-events-none block", className)}
      >
        {text}
      </span>

      {shouldScroll ? (
        <motion.div
          className="inline-flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration }}
        >
          <span className={classNames("block", className)} style={{ paddingRight: GAP_PX }}>
            {text}
          </span>
          <span
            className={classNames("block", className)}
            style={{ paddingRight: GAP_PX }}
            aria-hidden="true"
          >
            {text}
          </span>
        </motion.div>
      ) : (
        <span className={classNames("block", className)}>{text}</span>
      )}
    </div>
  );
};

export default Marquee;
