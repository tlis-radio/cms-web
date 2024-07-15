import React from "react";

type PlayerDisplayProps = {
   title?: string;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ title }) => {
   return (
      <>
         <span className="px-2" data-tip={title}>
               <p className="line-clamp-1">{title}</p>
         </span>
         {
         // TODO - Only use Marquee when the text overflows, some conditional rendering needed
         // Nech sa páči, darček na dobrú noc :D -Jager 1:22 15.7.2024
         }
         <span className="px-2">
            <p className="line-clamp-1">Luca-Dante Spadafora feat. Pingu & Mozart</p>
         </span>
      </>
   );
};

export default PlayerDisplay;