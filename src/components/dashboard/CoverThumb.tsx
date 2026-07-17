'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

type CoverThumbSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<CoverThumbSize, string> = {
   xs: 'w-8 h-8',
   sm: 'w-12 h-12',
   md: 'w-14 h-14',
   lg: 'w-24 h-24',
};

type CoverThumbProps = {
   assetId?: string | null;
   alt: string;
   size?: CoverThumbSize;
   className?: string;
};

export default function CoverThumb({ assetId, alt, size = 'md', className }: CoverThumbProps) {
   const sizeClass = className || SIZE_CLASSES[size];

   if (!assetId) {
      return (
         <div className={`${sizeClass} rounded bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-500`}>
            <FontAwesomeIcon icon={faMicrophone} />
         </div>
      );
   }

   return (
      <img
         src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${assetId}`}
         alt={alt}
         className={`${sizeClass} rounded object-cover bg-gray-700 flex-shrink-0`}
      />
   );
}
