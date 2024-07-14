import React from "react";

type PlayerDisplayProps = {
   title?: string;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ title }) => {
   return (
      <>
         <span className="px-2" data-tip={title}>
            <p className="line-clamp-1">{title} {title} {title}</p>
         </span>
         {
         // TODO - Make this text scrolling when longer than the container it's located in
         // The following and previous code is a placeholder for the marquee animation which we might or might not implement depending on the complexity, line-clamp-1 forces text to only be displayed on one line. -Jager 15.7.2024 0:33
         }
         <span className="px-2">
            <p className="line-clamp-1">Luca-Dante Spadafora feat. Pingu & Mozart</p>
         </span>
      </>
   );
};

export default PlayerDisplay;