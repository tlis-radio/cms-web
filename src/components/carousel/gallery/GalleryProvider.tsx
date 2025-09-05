"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

type GalleryContextType = {
    src: string[];
    setSrc: (src: string[]) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    showImages: (images: string[]) => void;
};

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const useGallery = () => {
    const context = useContext(GalleryContext);
    if (!context) {
        throw new Error('useGallery must be used within a GalleryProvider');
    }
    return context;
};

type GalleryProviderProps = {
    children: ReactNode;
};

export const GalleryProvider: React.FC<GalleryProviderProps> = ({
    children,
}) => {
    const [src, setSrc] = useState<string[]>([]);
    const [open, setOpen] = useState<boolean>(false);

    function showImages(images: string[]) {
        setSrc(images);
        setOpen(true);
    }

    return (
        <GalleryContext.Provider value={{ src, setSrc, open, setOpen, showImages }}>
            {children}
        </GalleryContext.Provider>
    );
};