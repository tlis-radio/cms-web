"use client";

import { useGallery } from "./GalleryProvider";

export default function GalleryThumbnail({ src, alt, className, gallerySrc }:
    { src: string; alt: string; className?: string; gallerySrc?: string[] }) {
    const { showImages } = useGallery();

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} cursor-pointer`}
            onClick={() => showImages([src, ...(gallerySrc || [])])}
        />
    );
}