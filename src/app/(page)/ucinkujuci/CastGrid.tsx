"use client";
import React from "react";
import Link from "next/link";

export default function CastGrid({
  cast,
  loadingError,
}: {
  cast: any[];
  loadingError?: boolean;
}) {
  if (loadingError) {
    return (
      <div className="px-8 py-8">
        <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
          Chyba pri načítaní údajov
        </h3>
        <p className="text-gray-200 mb-4">
          Účinkujúci sa nepodarilo načítať. Skúste to prosím neskôr.
        </p>
      </div>
    );
  }

  if (!cast || cast.length === 0) {
    return (
      <div className="px-8 py-8">
        <p className="text-gray-400">Zatiaľ žiadni účinkujúci</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="px-8 mb-8">
        <h1 className="text-4xl text-white font-semibold mb-2">
          <span className="text-[#d43c4a] italic text-[1.4em] mr-2">
            TLIS
          </span>{" "}
          účinkujúci
        </h1>

        <p className="text-gray-400 text-lg">
          {cast.length}{" "}
          {cast.length === 1
            ? "účinkujúci"
            : cast.length < 5
            ? "účinkujúci"
            : "účinkujúcich"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8">
        {cast.map((member, index) => (
          <Link
            key={index}
            href={`/ucinkujuci/${member.Slug}`}
            className="
              group rounded-xl border border-gray-800/60 bg-[#161616]/80 
              hover:bg-[#1d1d1d] 
              transition-all duration-300 
              hover:border-[#d43c4a]/50 
              hover:shadow-[0_0_20px_-5px_rgba(212,60,74,0.35)]
              p-5 flex flex-col gap-3
            "
          >
            {/* Name */}
            <h3
              className="
                text-white text-lg font-semibold 
                group-hover:text-[#d43c4a] 
                transition-colors
              "
            >
              {member.Name}
            </h3>

            {/* Description */}
            {member.Description && (
              <p
                className="
                  text-gray-400 text-sm 
                  line-clamp-3 leading-relaxed
                "
              >
                {member.Description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
