"use client";
import React, { useMemo } from "react";
import Markdown from "react-markdown";
import { parseCustomTags, CustomTag } from "@/lib/markdown-parser";
import EpisodeEmbed from "@/components/EpisodeEmbed";
import { Episode } from "@/models/episode";
import { ShowDto } from "@/types/show";
import { useGallery } from "@/components/carousel/gallery/GalleryProvider";
import "./blog.css";

interface ArticleContentProps {
   content: string;
   episodes?: Map<number, Episode>;
   episodeShows?: Map<number, ShowDto>;
   onHeadingInView?: (id: string) => void;
}

export default function ArticleContent({ content, episodes = new Map(), episodeShows = new Map() }: ArticleContentProps) {
   const parts = parseCustomTags(content);
   const { showImages } = useGallery();
   const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";

   // Extract all image URLs from markdown content
   const markdownImages = useMemo(() => {
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      const images: string[] = [];
      let match;
      
      parts.forEach(part => {
         if (typeof part === "string") {
            while ((match = imageRegex.exec(part)) !== null) {
               const src = match[1];
               // Build full URL
               const fullUrl = src.startsWith("http") ? src : `${DIRECTUS_URL}/assets/${src}?quality=90`;
               images.push(fullUrl);
            }
         }
      });
      
      return images;
   }, [content, DIRECTUS_URL]);

   const handleImageClick = (src: string) => {
      const index = markdownImages.findIndex(img => img.includes(src.split('?')[0]));
      if (index !== -1) {
         showImages(markdownImages, index);
      }
   };

   const renderPart = (part: string | CustomTag, index: number) => {
      if (typeof part === "string") {
         return (
            <Markdown
               key={index}
               components={{
                  h1: ({ children, ...props }) => {
                     const id = children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `heading-${index}`;
                     return <h1 id={id} {...props}>{children}</h1>;
                  },
                  h2: ({ children, ...props }) => {
                     const id = children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `heading-${index}`;
                     return <h2 id={id} {...props}>{children}</h2>;
                  },
                  h3: ({ children, ...props }) => {
                     const id = children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `heading-${index}`;
                     return <h3 id={id} {...props}>{children}</h3>;
                  },
                  h4: ({ children, ...props }) => {
                     const id = children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `heading-${index}`;
                     return <h4 id={id} {...props}>{children}</h4>;
                  },
                  a: ({ href, children, ...props }) => (
                     <a 
                        href={href} 
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                        {...props}
                     >
                        {children}
                     </a>
                  ),
                  img: ({ src, alt, ...props }) => {
                     const imgSrc = src?.startsWith("http") ? src : `${DIRECTUS_URL}/assets/${src}`;
                     return (
                        <img 
                           src={imgSrc} 
                           alt={alt || ""} 
                           className="rounded-lg max-w-full h-auto my-4 max-h-[500px] justify-self-center cursor-pointer hover:opacity-90 transition-opacity"
                           loading="lazy"
                           onClick={() => handleImageClick(src || "")}
                           {...props}
                        />
                     );
                  },
               }}
            >
               {part}
            </Markdown>
         );
      }

      // Handle custom tags
      if (part.type === "episode") {
         const episodeId = parseInt(part.value);
         const episode = episodes.get(episodeId);
         const show = episodeShows.get(episodeId);
         if (episode) {
            return (
               <EpisodeEmbed 
                  key={index} 
                  episode={episode} 
                  showName={show?.Title}
                  showSlug={show?.Slug}
               />
            );
         }
         return (
            <div key={index} className="w-full bg-gray-800 p-4 rounded-lg my-6 text-gray-400 text-center">
               Epizóda nenájdená
            </div>
         );
      }

      // Unknown tag - render as text
      return <span key={index}>{part.raw}</span>;
   };

   return (
      <div id="article-content" className="blog-content prose prose-invert max-w-none">
         {parts.map(renderPart)}
      </div>
   );
}
