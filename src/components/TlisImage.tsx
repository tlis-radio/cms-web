'use client'
import { ImageProps } from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";

interface TlisImageProps extends ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
}

const TlisImage: React.FC<TlisImageProps> = ({ src, width = 500, height = 500, quality = 100, alt, ...props }) => {
    const imgRef = useRef<HTMLDivElement>(null);
    const [renderSize, setRenderSize] = useState<{ width: number; height: number }>({
        width: Number(width),
        height: Number(height),
    });

    const updateSize = useCallback(() => {
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            setRenderSize({
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            });
        }
    }, []);

    useEffect(() => {
        updateSize();
        const interval = setInterval(updateSize, 1000);
        return () => clearInterval(interval);
    }, [updateSize]);

    const modifiedSrc = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${src}?width=${renderSize.width}&quality=${quality || 75}`;

    return (
        <div ref={imgRef} style={{ width: "100%", height: "100%" }}>
            <img
                src={modifiedSrc}
                width={renderSize.width}
                height={renderSize.height}
                alt={alt}
                {...props}
            />
        </div>
    );
};

export default TlisImage;
