import { useState } from "react";
import { GrGlobe } from "react-icons/gr";

interface TeamPanelSectionProps {
  opponentTeam: string;
  opponentLogoImage: string;
  className?: string;
}

export default function TeamPanelSection({ 
  opponentTeam, 
  opponentLogoImage, 
  className = "" 
}: TeamPanelSectionProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  return (
    <div className={`w-full flex flex-row justify-around items-center ${className}`}>
      {/* Home Team */}
      <div className="flex flex-col items-center flex-1">
        <img 
          src="/images/warriors-logo-black.png" 
          alt="Warriors Logo" 
          className="h-8 w-8 md:h-12 md:w-12 lg:h-20 lg:w-20 object-contain mb-2"
        />
        <span className="text-sm md:text-lg lg:text-xl font-bold text-gray-900 text-center">Warriors</span>
      </div>
      
      {/* VS */}
      <div className="flex-shrink-0 px-2 md:px-4">
        <span className="text-base md:text-xl lg:text-2xl font-bold text-gray-800">VS</span>
      </div>
      
      {/* Away Team */}
      <div className="flex flex-col items-center flex-1">
        {!imageError ? (
          <img 
            src={`/images/team-logos/${opponentLogoImage}`} 
            alt={`${opponentTeam} Logo`} 
            className="h-8 w-8 md:h-12 md:w-12 lg:h-20 lg:w-20 object-contain mb-2"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-8 w-8 md:h-12 md:w-12 lg:h-20 lg:w-20 items-center justify-center mb-2 bg-gray-100 rounded-full">
            <GrGlobe className="h-4 w-4 md:h-6 md:w-6 lg:h-10 lg:w-10 text-gray-500" />
          </div>
        )}
        <span className="text-sm md:text-lg lg:text-xl font-bold text-gray-900 text-center">{opponentTeam}</span>
      </div>
    </div>
  );
}
