import React from "react";
import { faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SlideButton: React.FC<{isVisible: boolean, onClick: () => void }> = ({isVisible, onClick}) => {
    const buttonStyle = {
        transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
        transition: 'transform 0.3s ease-in-out',
    };


    return (
        <div className="fixed bottom-2 right-2 z-20 sm:hidden">
            <button style={buttonStyle} onClick={onClick}>
                <FontAwesomeIcon className="text-4xl" icon={faCircleChevronDown} />
            </button>
        </div>  
    );
};

export default SlideButton;