import React, { useState, useRef, useEffect } from "react";

type Option = {
	label: string;
	value: string;
};

type SelectProps = {
	options: Option[];
	value: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder = "Select...", className }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	const selected = options.find((opt) => opt.value === value);

	return (
		   <div ref={ref} className={`relative select-none ${className || ""}`.trim()}>
			   <div
				   className={
					   `cursor-pointer border border-white/30 rounded px-3 py-2 bg-[#18181b] flex items-center justify-between transition-colors duration-150 ` +
					   (open ? "ring-2 ring-[#d43c4a]" : "hover:border-[#d43c4a]")
				   }
				   onClick={() => setOpen((o) => !o)}
				   tabIndex={0}
				   onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o); }}
			   >
				   <span className={selected ? "text-white" : "text-gray-400"}>{selected ? selected.label : placeholder}</span>
                   <span className={`ml-2 text-white transition-transform duration-150 ${open ? "rotate-180" : ""}`}>▾</span>
			   </div>
			   {open && (
				   <div className="absolute left-0 right-0 mt-1 bg-[#23232b] border border-white/20 rounded shadow-lg z-20 max-h-60 overflow-auto animate-fade-in">
					   {options.length === 0 ? (
						   <div className="px-3 py-2 text-gray-400">No options</div>
					   ) : (
						   options.map((opt) => (
							   <div
								   key={opt.value}
								   className={
									   `px-3 py-2 cursor-pointer transition-colors duration-100 ` +
									   (value === opt.value
										   ? "bg-[#d43c4a] text-white"
										   : "text-white hover:bg-[#2d2d38] hover:text-[#d43c4a]")
								   }
								   onClick={() => {
									   onChange(opt.value);
									   setOpen(false);
								   }}
							   >
								   {opt.label}
							   </div>
						   ))
					   )}
				   </div>
			   )}
		   </div>
	);
};

export default Select;
