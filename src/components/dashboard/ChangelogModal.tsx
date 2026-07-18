'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { CHANGELOG_ENTRIES } from './changelog-data';

type ChangelogModalProps = {
   open: boolean;
   onClose: () => void;
   onAcknowledge: () => void;
};

export default function ChangelogModal({ open, onClose, onAcknowledge }: ChangelogModalProps) {
   if (!open) return null;

   const formatDate = (date: string) =>
      new Date(date).toLocaleDateString('sk-SK', { year: 'numeric', month: 'long', day: 'numeric' });

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/60" onClick={onClose} />
         <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
               <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="text-[#d43c4a]" />
                  Čo je nové
               </div>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1">
                  <FontAwesomeIcon icon={faXmark} />
               </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5">
               {CHANGELOG_ENTRIES.map((entry) => (
                  <div key={entry.date}>
                     <div className="text-xs text-gray-500 mb-1">{formatDate(entry.date)}</div>
                     <div className="text-sm font-semibold text-white mb-1">{entry.title}</div>
                     <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">{entry.body}</div>
                  </div>
               ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-800 flex justify-end">
               <button
                  onClick={() => {
                     onAcknowledge();
                     onClose();
                  }}
                  className="px-4 py-2 text-sm bg-[#d43c4a] hover:bg-[#b83744] text-white rounded-md transition-colors"
               >
                  OK
               </button>
            </div>
         </div>
      </div>
   );
}
