import React from "react";

type PlayerDisplayProps = {
   title?: string;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ title }) => {
   return (
      <>
         <span>
            <p className="w-fit rounded-full bg-red-900 px-2 text-sm">#TLIS</p>
         </span>
         <span className="truncate" data-tip={title}>
            {title}
         </span>
      </>
   );
};

export default PlayerDisplay;