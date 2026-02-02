"use client";
import React from "react";
import Markdown from "react-markdown";
import { parseCustomTags, CustomTag } from "@/lib/markdown-parser";
import EpisodeEmbed from "@/components/EpisodeEmbed";
import { Episode } from "@/models/episode";
import { ShowDto } from "@/types/show";
import "./blog.css";

interface ArticleContentProps {
   content: string;
   episodes?: Map<number, Episode>;
   episodeShows?: Map<number, ShowDto>;
   onHeadingInView?: (id: string) => void;
}

export default function ArticleContent({ content, episodes = new Map(), episodeShows = new Map() }: ArticleContentProps) {
   const parts = parseCustomTags(content);

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
                  img: ({ src, alt, ...props }) => (
                     <img 
                        src={src?.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${src}`} 
                        alt={alt || ""} 
                        className="rounded-lg max-w-full h-auto my-4"
                        loading="lazy"
                        {...props}
                     />
                  ),
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
