'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGallery } from "./GalleryProvider";
import { useState, useEffect } from "react";
import { faXmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function GalleryOverlay() {
    const { open, src, setOpen, initialIndex } = useGallery();

    const [current, setCurrent] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState<{ x: number; y: number } | null>(null);

    function handleKeyDown(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === "Escape") {
            setOpen(false);
        }
        if (e.key === "ArrowLeft") {
            setCurrent((prev) => (prev === 0 ? src.length - 1 : prev - 1));
            setZoom(1);
            setOffset({ x: 0, y: 0 });
        }
        if (e.key === "ArrowRight") {
            setCurrent((prev) => (prev === src.length - 1 ? 0 : prev + 1));
            setZoom(1);
            setOffset({ x: 0, y: 0 });
        }
    }

    useEffect(()=>{
        window.addEventListener("keyup", handleKeyDown);
        return () => {
            window.removeEventListener("keyup", handleKeyDown);
        };
    })

    useEffect(() => {
        setOffset({ x: 0, y: 0 });
        setZoom(1);
        if (open) {
            setCurrent(initialIndex);
            const original = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = original;
            };
        }
    }, [open, initialIndex]);

    if (!open) return null;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrent((prev) => (prev === 0 ? src.length - 1 : prev - 1));
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrent((prev) => (prev === src.length - 1 ? 0 : prev + 1));
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        setZoom((z) => Math.max(1, Math.min(3, z + (e.deltaY < 0 ? 0.2 : -0.2))));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging || !start) return;
        setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    function getSrc(src: string) {
        return src.split('?')[0]
    }

    return (
        <div
            className="z-[100] fixed inset-0 bg-black bg-opacity-70"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Close (cross) button */}
            <button
                className="fixed top-4 right-4 text-white rounded p-2"
                onClick={() => setOpen(false)}
                aria-label="Close"
            >
                <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>

            {/* Left arrow */}
            {src.length > 1 && (
                <button
                    className="fixed left-4 top-1/2 -translate-y-1/2 text-white rounded-full p-1 hover:bg-opacity-100"
                    onClick={handlePrev}
                    aria-label="Previous"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="h-6 w-6" />
                </button>
            )}

            {/* Right arrow */}
            {src.length > 1 && (
                <button
                    className="fixed right-4 top-1/2 -translate-y-1/2 text-white rounded-full p-1 hover:bg-opacity-100"
                    onClick={handleNext}
                    aria-label="Next"
                >
                    <FontAwesomeIcon icon={faChevronRight} className="h-6 w-6" />
                </button>
            )}

            {/* Image with zoom and pan */}
            <div
                className="flex flex-col items-center justify-center min-h-screen"
                style={{ pointerEvents: "none" }}
            >
                <div
                    className="flex items-center justify-center"
                    style={{ width: "100vw", height: "100vh", pointerEvents: "auto" }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setOpen(false);
                        }
                    }}
                >
                    <img
                        src={getSrc(src[current])}
                        alt={`Gallery image ${current}`}
                        className="select-none"
                        draggable={false}
                        style={{
                            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                            transition: dragging ? "none" : "transform 0.2s",
                            cursor: (dragging ? "grabbing" : "grab"),
                            maxHeight: "90vh",
                            maxWidth: "90vw",
                            userSelect: "none",
                        }}
                        onDoubleClick={() => {
                            if (zoom === 1) {
                                setZoom(2);
                            } else {
                                setZoom(1);
                                setOffset({ x: 0, y: 0 });
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
