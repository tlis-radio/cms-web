import React from "react";

export default function NotFound({ message }: { message?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <h1 className="text-6xl font-bold text-[#96120F] mb-4">404</h1>
            {message}
            <p className="text-white text-center uppercase">Ajaj, toto tu nemáme :(</p>
            <div className="flex gap-4 mt-4">
                <a
                    href="https://instagram.com/radiotlis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#d43c4a] text-white hover:bg-[#b83744] w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                </a>
                <a
                    href="https://facebook.com/radiotlis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#d43c4a] text-white hover:bg-[#b83744] w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                </a>
            </div>
        </div>
    );
}