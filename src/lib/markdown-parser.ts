import React from 'react';

export type CustomTag = {
   type: string;
   value: string;
   raw: string;
};

export function parseCustomTags(content: string): (string | CustomTag)[] {
   const pattern = /@\[(\w+):([^\]]+)\]/g;
   const parts: (string | CustomTag)[] = [];
   let lastIndex = 0;
   let match;

   while ((match = pattern.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
         parts.push(content.slice(lastIndex, match.index));
      }
      
      // Add the custom tag
      parts.push({
         type: match[1],
         value: match[2],
         raw: match[0]
      });

      lastIndex = pattern.lastIndex;
   }

   // Add remaining text
   if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
   }

   return parts;
}

export function extractEpisodeIds(content: string): number[] {
   const pattern = /@\[episode:(\d+)\]/g;
   const ids: number[] = [];
   let match;

   while ((match = pattern.exec(content)) !== null) {
      ids.push(parseInt(match[1]));
   }

   return ids;
}
