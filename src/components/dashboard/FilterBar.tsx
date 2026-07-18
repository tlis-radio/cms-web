'use client';

type FilterBarProps = {
   title?: string;
   children: React.ReactNode;
   'data-tour'?: string;
};

export default function FilterBar({ title, children, ...rest }: FilterBarProps) {
   return (
      <div
         {...rest}
         className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-2 mb-4 bg-gray-900/95 backdrop-blur border-b border-gray-800 flex items-center justify-between gap-4 flex-wrap"
      >
         {title ? <h1 className="text-sm font-semibold text-white">{title}</h1> : <span />}
         <div className="ml-auto flex items-center gap-2 flex-wrap">{children}</div>
      </div>
   );
}
