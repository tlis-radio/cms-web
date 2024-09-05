'use client';
import Player from "./player";
import SlideButton from "./slide-button";
import React, { useState } from 'react';

const PlayerComponent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
      <>
         <Player isVisible={isVisible}/>
         <SlideButton isVisible={isVisible} onClick={toggleVisibility}/>
      </>
    );
};

export default PlayerComponent;