"use client";
import FilterBar from "@/components/dashboard/FilterBar";
import {
  faArrowDown,
  faArrowUp,
  faStickyNote,
  faPlayCircle,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/dist/client/link";
import { useState } from "react";

type TimeFilter = "all" | "12m" | "6m" | "3m" | "1m" | "7d";
type RetentionFilter = "archive" | "live";

function EpisodesList({ episodes }: { episodes: any[] }) {
  return (
    <div className="flex flex-col gap-3">
      {[
        {
          title: "Epizóda 1",
          length: "30 min",
          date: "12.06.2024",
          views: 100,
        },
        {
          title: "Epizóda 2",
          length: "45 min",
          date: "15.06.2024",
          views: 150,
        },
        {
          title: "Epizóda 3",
          length: "25 min",
          date: "18.06.2024",
          views: 200,
        },
      ].map((episode, index) => (
        <div key={index} className="flex items-center cursor-pointer">
          <div className="w-8 h-8">
            <img
              src={`https://picsum.photos/seed/${index}/256/256`}
              className="rounded-md w-full object-cover"
            />
          </div>
          <div className="flex flex-col ml-2">
            <span className="text-sm text-white">{episode.title}</span>
            <span className="text-xs text-gray-300">
              {episode.date} • {episode.length}
            </span>
          </div>
          <span className="text-lg text-gray-300 ml-auto">{episode.views}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [retentionFilter, setRetentionFilter] =
    useState<RetentionFilter>("archive");

  const [myShows, setMyShows] = useState([
    { id: 1, title: "Relácia 1", date: "12.06.2024", isSelected: false },
    { id: 2, title: "Relácia 2", date: "15.06.2024", isSelected: false },
  ]);

  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
    { value: "all", label: "Celé obdobie" },
    { value: "12m", label: "Posledných 12 mesiacov" },
    { value: "6m", label: "Posledných 6 mesiacov" },
    { value: "3m", label: "Posledné 3 mesiace" },
    { value: "1m", label: "Posledný mesiac" },
    { value: "7d", label: "Posledných 7 dní" },
  ];

  //   https://dribbble.com/shots/26519801-TuneAI-AI-Music-Generator-Dashboard

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4">
            {[
              {
                title: "Počet epizód",
                value: 10,
                diff: -20,
              },
              {
                title: "Počet poslucháčov",
                value: 100,
                diff: 10,
              },
              {
                title: "Počet zdielaní",
                value: 50,
                diff: 5,
              },
            ].map((show, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col bg-[#96120F] border-500 rounded-lg p-4 text-white gap-3"
              >
                <div className="flex gap-1 mr-4 justify-between items-center w-full">
                  <div className="rounded-md bg-[#d43c4ae6] p-2 aspect-square flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      width={18}
                      height={18}
                    />
                  </div>
                  <div className="flex gap-3 items-center text-sm font-thin">
                    <FontAwesomeIcon
                      icon={show.diff > 0 ? faArrowUp : faArrowDown}
                    />
                    <span>{show.diff}%</span>
                  </div>
                </div>
                <span className="flex flex-col">
                  <span className="text-sm font-thin">{show.title}</span>
                  <span className="text-lg font-bold">{show.value}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {timeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  timeFilter === option.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-md text-white">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-md font-bold text-white">
                Aktivita poslucháčov
              </span>
            </div>
              <div className="flex flex-col gap-3 bg-red-500 w-full">
                placeholder for a graph upon clicking an episode, show retention
                graph
              </div>
          </div>

          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-md text-white">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-md font-bold text-white">
                Top relácie podľa priemernej udržateľnosti
              </span>
              <span
                className="ml-auto cursor-pointer px-3 py-1.5 text-xs rounded-lg transition bg-gray-800 text-gray-300 hover:bg-gray-700"
                onClick={() =>
                  setRetentionFilter(
                    retentionFilter === "archive" ? "live" : "archive",
                  )
                }
              >
                {retentionFilter === "archive" ? "Archívne" : "Live"}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col gap-3 min-w-[300px]">
                {[
                  {
                    title: "Epizóda 1",
                    length: "30 min",
                    date: "12.06.2024",
                    percentage: 30,
                  },
                  {
                    title: "Epizóda 2",
                    length: "45 min",
                    date: "15.06.2024",
                    percentage: 45,
                  },
                  {
                    title: "Epizóda 3",
                    length: "25 min",
                    date: "18.06.2024",
                    percentage: 25,
                  },
                ].map((episode, index) => (
                  <div key={index} className="flex items-center cursor-pointer">
                    <div className="w-10 h-10">
                      <img
                        src={`https://picsum.photos/seed/${index}/256/256`}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex gap-8 items-center w-full">
                      <div className="flex flex-col ml-2">
                        <span className="text-sm text-white">
                          {episode.title}
                        </span>
                        <span className="text-xs text-gray-300">
                          {episode.date} • {episode.length}
                        </span>
                      </div>
                      <span className="text-lg text-gray-300 ml-auto">
                        {episode.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 bg-red-500 w-full">
                placeholder for a graph upon clicking an episode, show retention
                graph
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-white">
            <div className="flex w-full flex-col gap-2 bg-black/20 p-4 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">
                  Trendy epizódy podľa vypočutí
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    title: "Epizóda 1",
                    length: "30 min",
                    date: "12.06.2024",
                    views: 100,
                  },
                  {
                    title: "Epizóda 2",
                    length: "45 min",
                    date: "15.06.2024",
                    views: 150,
                  },
                  {
                    title: "Epizóda 3",
                    length: "25 min",
                    date: "18.06.2024",
                    views: 200,
                  },
                ].map((episode, index) => (
                  <div key={index} className="flex items-center cursor-pointer">
                    <div className="w-8 h-8">
                      <img
                        src={`https://picsum.photos/seed/${index}/256/256`}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white">
                        {episode.title}
                      </span>
                      <span className="text-xs text-gray-300">
                        {episode.date} • {episode.length}
                      </span>
                    </div>
                    <span className="text-lg text-gray-300 ml-auto">
                      {episode.views}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 bg-black/20 p-4 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">Tvorcovia</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    name: "Spachtla",
                    episodes: 12,
                    views: 100,
                  },
                  {
                    name: "Multivitamin",
                    episodes: 2,
                    views: 200,
                  },
                  {
                    name: "Rohan",
                    episodes: 1,
                    views: 250,
                  },
                ].map((creator, index) => (
                  <div key={index} className="flex items-center cursor-pointer">
                    <div className="w-8 h-8">
                      <img
                        src={`https://picsum.photos/seed/${index}/256/256`}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white">{creator.name}</span>
                      <span className="text-xs text-gray-300">
                        {creator.episodes} • {creator.views} views
                      </span>
                    </div>
                    <span className="text-lg text-gray-300 ml-auto">
                      {creator.episodes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-[450px]">
          <div className="bg-black/20 p-4 rounded-md flex flex-col gap-4">
            <div>
              <div className="flex gap-4 items-center">
                <div className="rounded-full bg-[#96120F] p-4 text-white">
                  TM
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-thin">
                    Tlisak Moderator
                    {/* DirectusUser field under Members collection to retrieve the cast and his episodes */}
                    {/*  from this there is a way to get Cast object as well as the role */}
                  </span>
                  <span className="text-xs text-gray-300">Moderátor</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4 bg-black/20 p-4 rounded-md">
                <span className="text-md font-bold text-white">
                  Moje relácie
                </span>
                <div className="flex flex-col gap-2">
                  {myShows.map((show, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => {
                        const newShows = [...myShows];
                        newShows[index].isSelected =
                          !newShows[index].isSelected;
                        setMyShows(newShows);
                      }}
                    >
                      <span
                        className={`text-sm ${show.isSelected ? "text-[#d43c4ae6]" : "text-white"}`}
                      >
                        {show.title}
                      </span>
                      <span className="text-xs text-gray-300">{show.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded-md flex flex-col gap-4">
            <div className="flex flex-col mt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">
                  Posledné epizódy
                </span>
                <Link
                  href="/dashboard/episodes"
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  Zobraziť všetky
                </Link>
              </div>
              <div className="flex flex-col gap-3 mt-4 bg-black/20 p-4 rounded-md">
                {[
                  {
                    title: "Epizóda 1",
                    length: "30 min",
                    date: "12.06.2024",
                    views: 100,
                  },
                  {
                    title: "Epizóda 2",
                    length: "45 min",
                    date: "15.06.2024",
                    views: 150,
                  },
                  {
                    title: "Epizóda 3",
                    length: "25 min",
                    date: "18.06.2024",
                    views: 200,
                  },
                ].map((episode, index) => (
                  <div key={index} className="flex items-center cursor-pointer">
                    <div className="w-14 h-14">
                      <img
                        src={`https://picsum.photos/seed/${index}/256/256`}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white">
                        {episode.title}
                      </span>
                      <span className="text-xs text-gray-300">
                        {episode.date} • {episode.length}
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        <FontAwesomeIcon
                          icon={faPlayCircle}
                          width={16}
                          height={16}
                          className="text-gray-300"
                        />
                        <span className="text-xs text-gray-300">
                          {episode.views}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <FontAwesomeIcon
                        icon={faShare}
                        width={16}
                        height={16}
                        className="text-gray-300 hover:text-[#d43c4ae6]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
