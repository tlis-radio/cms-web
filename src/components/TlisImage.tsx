'use client'
import { ImageProps } from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useGallery } from "./carousel/gallery/GalleryProvider";

interface TlisImageProps extends ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    sizeMultiplier?: number; /* some images are not crisp */
    preview?: boolean;
}

const TlisImage: React.FC<TlisImageProps> = ({ src, width = 500, height = 500, alt, sizeMultiplier = 1, preview, ...props }) => {
    const imgRef = useRef<HTMLDivElement>(null);
    const { showImages } = useGallery();
    const [renderSize, setRenderSize] = useState<{ width: number; height: number }>({
        width: Number(width),
        height: Number(height),
    });

    const updateSize = useCallback(() => {
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            // Skip zero-size measurements (e.g. before the grid/flex layout has
            // resolved a track width) so we never bake a broken `?width=0` into
            // the image URL - keep the last known-good size until a real one lands.
            if (rect.width > 0 && rect.height > 0) {
                setRenderSize({
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                });
            }
        }
    }, []);

    useEffect(() => {
        updateSize();
        const node = imgRef.current;
        if (!node || typeof ResizeObserver === "undefined") {
            const interval = setInterval(updateSize, 1000);
            return () => clearInterval(interval);
        }
        const observer = new ResizeObserver(updateSize);
        observer.observe(node);
        return () => observer.disconnect();
    }, [updateSize]);

    const modifiedSrc = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${src}?width=${Math.floor(renderSize.width * sizeMultiplier)}&quality=${100}`;

    return (
        <>
            <div ref={imgRef} style={{ width: "100%", height: "100%" }}
                onClick={() => { if (preview) { showImages([modifiedSrc]) } }} className={preview ? "cursor-pointer" : ""}>
                <img
                    src={modifiedSrc}
                    width={renderSize.width}
                    height={renderSize.height}
                    loading="lazy"
                    alt={alt}
                    {...props}
                />
            </div>
        </>
    );
};

export default TlisImage;
