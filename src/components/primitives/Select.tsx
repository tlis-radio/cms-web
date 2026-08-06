import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
	compact?: boolean;
	searchable?: boolean;
	searchPlaceholder?: string;
	disabled?: boolean;
};

type PanelCoords = {
	left: number;
	width: number;
	top?: number;
	bottom?: number;
	maxHeight: number;
	fontFamily: string;
};

const PANEL_MARGIN = 8;
const MIN_PANEL_HEIGHT = 120;
const MAX_PANEL_HEIGHT = 320;

function computePanelCoords(trigger: HTMLElement): PanelCoords {
	const rect = trigger.getBoundingClientRect();
	const viewportHeight = window.innerHeight;
	const viewportWidth = window.innerWidth;

	const spaceBelow = viewportHeight - rect.bottom - PANEL_MARGIN;
	const spaceAbove = rect.top - PANEL_MARGIN;
	const placeBelow = spaceBelow >= MIN_PANEL_HEIGHT || spaceBelow >= spaceAbove;

	const maxHeight = Math.min(MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, placeBelow ? spaceBelow : spaceAbove));

	let left = rect.left;
	if (left + rect.width > viewportWidth - PANEL_MARGIN) {
		left = Math.max(PANEL_MARGIN, viewportWidth - rect.width - PANEL_MARGIN);
	}
	left = Math.max(PANEL_MARGIN, left);

	return {
		left,
		width: rect.width,
		top: placeBelow ? rect.bottom + 4 : undefined,
		bottom: placeBelow ? undefined : viewportHeight - rect.top + 4,
		maxHeight,
		fontFamily: window.getComputedStyle(trigger).fontFamily,
	};
}

const Select: React.FC<SelectProps> = ({
	options,
	value,
	onChange,
	placeholder = "Select...",
	className,
	compact = false,
	searchable = false,
	searchPlaceholder = "Hľadať...",
	disabled = false,
}) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [coords, setCoords] = useState<PanelCoords | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	const toggleOpen = () => {
		if (disabled) return;
		setOpen((prev) => {
			const next = !prev;
			if (next && triggerRef.current) {
				setCoords(computePanelCoords(triggerRef.current));
			}
			return next;
		});
	};

	useEffect(() => {
		if (disabled && open) setOpen(false);
	}, [disabled, open]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (ref.current?.contains(target)) return;
			if (panelRef.current?.contains(target)) return;
			setOpen(false);
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

	useEffect(() => {
		if (open && searchable) {
			searchRef.current?.focus();
		} else {
			setQuery("");
		}
	}, [open, searchable]);

	useEffect(() => {
		if (!open) return;
		const reposition = () => {
			if (triggerRef.current) setCoords(computePanelCoords(triggerRef.current));
		};
		window.addEventListener("resize", reposition);
		window.addEventListener("scroll", reposition, true);
		return () => {
			window.removeEventListener("resize", reposition);
			window.removeEventListener("scroll", reposition, true);
		};
	}, [open]);

	const selected = options.find((opt) => opt.value === value);
	const filteredOptions =
		searchable && query.trim()
			? options.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()))
			: options;

	return (
		   <div ref={ref} className={`relative select-none ${className || ""}`.trim()}>
			   <div
				   ref={triggerRef}
				   className={
					   `border border-white/30 rounded bg-[#18181b] flex items-center justify-between transition-colors duration-150 ` +
					   (disabled ? "cursor-not-allowed opacity-50 " : "cursor-pointer ") +
					   (compact ? "px-2 py-1 text-sm " : "px-3 py-2 ") +
					   (open ? "ring-2 ring-[#d43c4a]" : disabled ? "" : "hover:border-[#d43c4a]")
				   }
				   onClick={toggleOpen}
				   tabIndex={disabled ? -1 : 0}
				   onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}
			   >
				   <span className={`truncate min-w-0 ${selected ? "text-white" : "text-gray-400"}`}>{selected ? selected.label : placeholder}</span>
                   <span className={`ml-2 text-white transition-transform duration-150 ${open ? "rotate-180" : ""}`}>▾</span>
			   </div>
			   {open && coords && createPortal(
				   <div
					   ref={panelRef}
					   style={{
						   position: "fixed",
						   left: coords.left,
						   width: coords.width,
						   top: coords.top,
						   bottom: coords.bottom,
						   maxHeight: coords.maxHeight,
						   fontFamily: coords.fontFamily,
					   }}
					   className="bg-[#23232b] border border-white/20 rounded shadow-lg z-50 flex flex-col animate-fade-in"
				   >
					   {searchable && (
						   <div className="p-1.5 border-b border-white/10 flex-shrink-0">
							   <input
								   ref={searchRef}
								   type="text"
								   value={query}
								   onChange={(e) => setQuery(e.target.value)}
								   onClick={(e) => e.stopPropagation()}
								   onKeyDown={(e) => e.stopPropagation()}
								   placeholder={searchPlaceholder}
								   className="w-full px-2 py-1 text-sm bg-[#18181b] border border-white/20 rounded text-white placeholder-gray-500 outline-none focus:border-[#d43c4a]"
							   />
						   </div>
					   )}
					   <div className="overflow-auto min-h-0 flex-1">
					   {filteredOptions.length === 0 ? (
						   <div className="px-3 py-2 text-gray-400">Žiadne výsledky</div>
					   ) : (
						   filteredOptions.map((opt) => (
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
				   </div>,
				   document.body
			   )}
		   </div>
	);
};

export default Select;
