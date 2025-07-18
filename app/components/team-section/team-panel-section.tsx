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
  return (
    <div className={`w-full flex flex-row justify-around items-center ${className}`}>
      {/* Home Team */}
      <div className="flex flex-col items-center flex-1">
        <img 
          src="/images/warriors-logo-black.png" 
          alt="Warriors Logo" 
          className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
        />
        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">Warriors</span>
      </div>
      
      {/* VS */}
      <div className="flex-shrink-0 px-2 md:px-4">
        <span className="text-xs md:text-sm lg:text-base font-bold text-gray-600">VS</span>
      </div>
      
      {/* Away Team */}
      <div className="flex flex-col items-center flex-1">
        <img 
          src={`/images/team-logos/${opponentLogoImage}`} 
          alt={`${opponentTeam} Logo`} 
          className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
        />
        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">{opponentTeam}</span>
      </div>
    </div>
  );
}
