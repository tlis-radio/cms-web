import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

const Marquee = ({ text, speed = 15, className }: { text: string; speed?: number; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollingTextRef = useRef<HTMLDivElement>(null);
  const staticTextRef = useRef<HTMLSpanElement>(null);

  const [shouldScroll, setShouldScroll] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current || (!scrollingTextRef.current && !staticTextRef.current)) return;

    const container = containerRef.current;
    const textEl = shouldScroll ? scrollingTextRef.current : staticTextRef.current;

    if (!textEl) return;

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(container.offsetWidth);
      setTextWidth(textEl.scrollWidth);
      setShouldScroll(textEl.scrollWidth > container.offsetWidth);
    });

    resizeObserver.observe(container);
    resizeObserver.observe(textEl);

    return () => resizeObserver.disconnect();
  }, [text, shouldScroll]);

  return (
    <div
      ref={containerRef}
      className={classNames("overflow-hidden whitespace-nowrap w-full", className)}
    >
      {shouldScroll ? (
        <motion.div
          ref={scrollingTextRef}
          className="inline-block"
          animate={{ x: ["100%", `-${textWidth}px`] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: speed,
          }}
        >
          <span className={classNames("block", className)}>{text}</span>
        </motion.div>
      ) : (
        <span ref={staticTextRef} className={classNames("block", className)}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Marquee;