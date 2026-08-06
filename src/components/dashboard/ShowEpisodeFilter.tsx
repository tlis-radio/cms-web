'use client';

import Select from '@/components/primitives/Select';

type Option = {
   value: string;
   label: string;
};

type ShowEpisodeFilterProps = {
   showOptions: Option[];
   episodeOptions: Option[];
   showValue: string;
   episodeValue: string;
   onShowChange: (value: string) => void;
   onEpisodeChange: (value: string) => void;
};

// Cascading show -> episode filter. Both selects stay mounted with fixed
// widths (episode select is disabled until a show is picked) so the bar
// never reflows when the show selection changes.
export default function ShowEpisodeFilter({
   showOptions,
   episodeOptions,
   showValue,
   episodeValue,
   onShowChange,
   onEpisodeChange,
}: ShowEpisodeFilterProps) {
   const showSelected = showValue !== 'all';

   return (
      <div className="flex items-center gap-2">
         <Select
            compact
            searchable
            searchPlaceholder="Hľadať reláciu..."
            options={showOptions}
            value={showValue}
            onChange={onShowChange}
            className="bg-gray-800 text-white w-[280px]"
         />
         <Select
            compact
            searchable
            searchPlaceholder="Hľadať epizódu..."
            options={episodeOptions}
            value={episodeValue}
            onChange={onEpisodeChange}
            disabled={!showSelected}
            placeholder="Všetky epizódy"
            className="bg-gray-800 text-white w-[280px]"
         />
      </div>
   );
}
