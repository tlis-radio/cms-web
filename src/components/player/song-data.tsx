import React from "react";

type PlayerDisplayProps = {
   title?: string;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ title }) => {
   return (
      <>
         <span className="w-fit px-2" data-tip={title}>
            {title}
         </span>
         {
         // TODO - Make this text scrolling when longer than the container it's located in
         }
         <span>
            <p className="w-fit px-2 text-sm">Luca-Dante Spadafora feat. Pingu </p>
         </span>
      </>
   );
};

export default PlayerDisplay;