import { Link } from '@/navigation';

const ViewAllButton = ({ href, label }: { href: string; label: string }) => {
   return (
      <Link
         href={href}
         aria-label={label}
         className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] text-white transition-colors"
      >
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
         </svg>
      </Link>
   );
};

export default ViewAllButton;
