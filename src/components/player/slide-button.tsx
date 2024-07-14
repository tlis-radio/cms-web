import React from "react";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SlideButton: React.FC<{isVisible: boolean, onClick: () => void }> = ({isVisible, onClick}) => {
    const buttonStyle = {
        transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.3s ease-in-out',
    };


    return (
        <div className="fixed bottom-2 right-2 z-20 sm:hidden">
            <span
                role="button"
                tabIndex={0}
                className="flex cursor-pointer text-2xl p-2.5 rounded-full bg-[#d43c4a] text-white"
                onClick={onClick}
            >
                <FontAwesomeIcon icon={faChevronDown} style={buttonStyle} />
            </span>
        </div>  
    );
};

export default SlideButton;