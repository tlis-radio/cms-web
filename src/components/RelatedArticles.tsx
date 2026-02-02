"use client";
import React from "react";
import Link from "next/link";
import { Article } from "@/types/article";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

interface RelatedArticlesProps {
   articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
   if (!articles || articles.length === 0) {
      return null;
   }

   return (
      <div className="mb-3">
         <div className="flex flex-wrap gap-2">
            {articles.map((article) => (
               <Link
                  key={article.id}
                  href={`/clanky/${article.slug}`}
                  className="inline-flex items-center gap-1.5 bg-[#d43c4a]/20 hover:bg-[#d43c4a]/30 text-[#d43c4a] text-xs font-medium px-2 py-1 rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
               >
                  <FontAwesomeIcon icon={faNewspaper} className="w-3 h-3" />
                  {article.title}
               </Link>
            ))}
         </div>
      </div>
   );
}
