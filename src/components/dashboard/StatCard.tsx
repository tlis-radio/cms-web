'use client';

import Link from 'next/link';

type Accent = 'red' | 'blue' | 'purple' | 'green' | 'yellow' | 'orange' | 'white';

const ACCENT_CLASSES: Record<Accent, string> = {
   red: 'text-red-400',
   blue: 'text-blue-400',
   purple: 'text-purple-400',
   green: 'text-green-400',
   yellow: 'text-yellow-400',
   orange: 'text-orange-400',
   white: 'text-white',
};

type StatCardProps = {
   label: string;
   value: React.ReactNode;
   accent?: Accent;
   href?: string;
};

export default function StatCard({ label, value, accent = 'white', href }: StatCardProps) {
   const content = (
      <>
         <div className="text-xs text-gray-400 mb-1">{label}</div>
         <div className={`text-lg font-bold ${ACCENT_CLASSES[accent]}`}>{value}</div>
      </>
   );

   const className = 'block bg-gray-800 rounded-lg p-3' + (href ? ' hover:bg-gray-700 transition' : '');

   if (href) {
      return (
         <Link href={href} className={className}>
            {content}
         </Link>
      );
   }

   return <div className={className}>{content}</div>;
}
