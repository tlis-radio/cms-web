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
               <p className="line-clamp-1">{title} {title} {title}_</p>
            </Marquee>
         </span>
         {
         // TODO - Make this text scrolling when longer than the container it's located in
         // Found a Marquee react library, working but need to fix the whitespace error being displayed
         }
         <span className="px-2">
            <Marquee autoFill direction="right">
               <p className="line-clamp-1">Luca-Dante Spadafora feat. Pingu & Mozart_</p>
            </Marquee>
         </span>
      </>
   );
};

export default PlayerDisplay;