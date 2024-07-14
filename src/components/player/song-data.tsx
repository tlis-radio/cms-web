import React from "react";
import Marquee from "react-fast-marquee";

type PlayerDisplayProps = {
   title?: string;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ title }) => {
   return (
      <>
         <span className="px-2" data-tip={title}>
            <Marquee autoFill direction="right">
               <p className="line-clamp-1">{title}</p>
            </Marquee>
         </span>
         {
         // TODO - Only use Marquee when the text overflows, some conditional rendering needed
         // Nech sa páči, darček na dobrú noc :D -Jager 1:22 15.7.2024
         }
         <span className="px-2">
            <Marquee autoFill direction="right">
               <p className="line-clamp-1">Luca-Dante Spadafora feat. Pingu & Mozart</p>
            </Marquee>
         </span>
      </>
   );
};

export default PlayerDisplay;