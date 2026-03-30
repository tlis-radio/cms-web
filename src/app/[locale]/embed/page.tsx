"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function EmbedIndexPage() {
  const t = useTranslations("EmbedIndex");

  return (
    <div className="min-h-screen text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <p className="text-zinc-400 mb-8">
          {t('description')}
        </p>

        <div className="space-y-4 text-left bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t('available_widgets')}</h2>
          
          <div className="border-b border-zinc-700 pb-4">
            <h3 className="font-medium text-[#d43c4a]">{t('show_list_title')}</h3>
            <p className="text-zinc-400 text-sm mt-1">
              {t('show_list_desc')}
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/show/[slug]
            </code>
          </div>

          <div className="border-b border-zinc-700 pb-4">
            <h3 className="font-medium text-[#d43c4a]">{t('episode_title')}</h3>
            <p className="text-zinc-400 text-sm mt-1">
              {t('episode_desc')}
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/episode/[id]
            </code>
          </div>

          <div className="pb-2">
            <h3 className="font-medium text-[#d43c4a]">{t('wide_episode_title')}</h3>
            <p className="text-zinc-400 text-sm mt-1">
              {t('wide_episode_desc')}
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/episode/[id]/wide
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}