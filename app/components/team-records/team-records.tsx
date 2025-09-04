import { getMostAssists, getMostGoals, getMostGoalsInASeason, getMostPoints, getQuickestGoal, getQuickestHattrick, type TeamRecord, type SeasonRecord, type AllTimeRecord, getMostAssistsInASeason, getMostPointsInASeason, getMostHattricksInASeason, getMostPowerPlayGoalsInASeason, getMostShortHandedGoalsInASeason, getMostGameWinningGoalsInASeason, getMostPowerPlayGoalsAllTime, getMostShortHandedGoalsAllTime, getMostGameWinningGoalsAllTime, getCareerGamesPlayedLeader, getCareerGoalsLeader, getCareerAssistsLeader, getCareerPointsLeader } from "~/helpers/team-records-helper";
import { useData, type DataContextType, type Result, type Player } from "../../contexts/DataContext";
import type { Season } from "../season-filter/season-filter";
import { useState } from "react";

interface TeamRecordsProps {
  selectedSeason: Season;
}

type AnyRecord = TeamRecord | SeasonRecord | AllTimeRecord;

interface RecordSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  records: AnyRecord[];
}

function calculateGameRecords(results: Result[], players: Player[]): TeamRecord[] {
  const records: TeamRecord[] = [];
  
  const mostGoals = getMostGoals(results, players);
  const mostAssists = getMostAssists(results, players);
  const mostPoints = getMostPoints(results, players);
  const quickestGoal = getQuickestGoal(results, players);
  const quickestHattrick = getQuickestHattrick(results, players);

    records.push(mostGoals);
    records.push(mostAssists);
    records.push(mostPoints);
    records.push(quickestGoal);
    records.push(quickestHattrick);

  return records;
}

function calculateSeasonRecords(results: Result[], players: Player[]): AnyRecord[] {
  const mostGoals = getMostGoalsInASeason(players);
  const mostAssists = getMostAssistsInASeason(players);
  const mostPoints = getMostPointsInASeason(players);
  const mostHattricks = getMostHattricksInASeason(results, players);
  const mostPowerPlayGoals = getMostPowerPlayGoalsInASeason(results, players);
  const mostShortHandedGoals = getMostShortHandedGoalsInASeason(results, players);
  const mostGameWinningGoals = getMostGameWinningGoalsInASeason(results, players);

  return [  
    mostGoals,
    mostAssists,
    mostPoints,
    mostHattricks,
    mostPowerPlayGoals,
    mostShortHandedGoals,
    mostGameWinningGoals,
  ];
}

function calculateAllTimeRecords(results: Result[], players: Player[]): AnyRecord[] {
  // Career leaders (all seasons combined)
  const careerGoals = getCareerGoalsLeader(players);
  const careerAssists = getCareerAssistsLeader(players);
  const careerPoints = getCareerPointsLeader(players);

  // Special teams and other all-time records
  const mostPowerPlayGoals = getMostPowerPlayGoalsAllTime(results, players);
  const mostShortHandedGoals = getMostShortHandedGoalsAllTime(results, players);
  const mostGameWinningGoals = getMostGameWinningGoalsAllTime(results, players);
  const mostGamesPlayed = getCareerGamesPlayedLeader(players);

  return [
    mostGamesPlayed,
    careerGoals,
    careerAssists,
    careerPoints,
    mostPowerPlayGoals,
    mostShortHandedGoals,
    mostGameWinningGoals,
  ];
}

const getCategoryColors = (category: string) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'goals': return '🥅';
      case 'assists': return '🎯';
      case 'points': return '⭐';
      case 'performance': return '⚡';
      default: return '🏒';
    }
  };

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'goals': return 'border-green-200 hover:border-green-300';
      case 'assists': return 'border-blue-200 hover:border-blue-300';
      case 'points': return 'border-purple-200 hover:border-purple-300';
      case 'performance': return 'border-orange-200 hover:border-orange-300';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getTextColors = (category: string) => {
    switch (category) {
      case 'goals': return { title: 'text-green-700', value: 'text-green-800', description: 'text-green-600' };
      case 'assists': return { title: 'text-blue-700', value: 'text-blue-800', description: 'text-blue-600' };
      case 'points': return { title: 'text-purple-700', value: 'text-purple-800', description: 'text-purple-600' };
      case 'performance': return { title: 'text-orange-700', value: 'text-orange-800', description: 'text-orange-600' };
      default: return { title: 'text-gray-700', value: 'text-gray-800', description: 'text-gray-600' };
    }
  };

  return {
    bg: `bg-white ${getBorderColor(category)}`,
    text: getTextColors(category),
    icon: getIcon(category)
  };
};

export default function TeamRecords({ selectedSeason }: TeamRecordsProps) {
  const { data }: DataContextType = useData();
  const [openSection, setOpenSection] = useState<string>('');
  
  const isOverall = selectedSeason === 'overall';
  const filteredResults = data.results.filter(result => result.seasonId === selectedSeason || isOverall);
  
  const recordSections: RecordSection[] = [
    {
      id: 'game-records',
      title: 'Game Records',
      description: 'Best single-game performances',
      icon: '🏒',
      records: calculateGameRecords(filteredResults, data.players)
    },
    {
      id: 'season-records',
      title: 'Season Records',
      description: 'Best performances within a season',
      icon: '📅',
      records: calculateSeasonRecords(data.results, data.players)
    },
    {
      id: 'alltime-records',
      title: 'All-Time Records',
      description: 'Career and franchise records',
      icon: '🏆',
      records: calculateAllTimeRecords(data.results, data.players) // Use all results for all-time
    }
  ];

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? '' : sectionId);
  };

  // Type guards to check record types
  const isTeamRecord = (record: AnyRecord): record is TeamRecord => {
    return 'holders' in record && record.holders.length > 0 && 'gameInfo' in record.holders[0];
  };

  const isSeasonRecord = (record: AnyRecord): record is SeasonRecord => {
    return 'holders' in record && record.holders.length > 0 && 'season' in record.holders[0];
  };

  const isAllTimeRecord = (record: AnyRecord): record is AllTimeRecord => {
    return 'holders' in record && record.holders.length > 0 && !('gameInfo' in record.holders[0]) && !('season' in record.holders[0]);
  };

  const renderRecord = (record: AnyRecord, index: number) => {
    const colors = getCategoryColors(record.category);
    
    return (
      <div
        key={index}
        className={`${colors.bg} border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 w-full min-w-0`}
      >
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-xl md:text-2xl flex-shrink-0">{colors.icon}</span>
            <div className="min-w-0 flex-1">
              <h3 className={`text-base md:text-lg font-bold ${colors.text.title} leading-tight break-words`}>
                {record.title}
              </h3>
              <p className={`text-xs md:text-sm ${colors.text.description} mt-1 leading-relaxed break-words`}>
                {record.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <span className="text-xs md:text-sm font-medium text-gray-600">Record:</span>
            <span className={`text-base md:text-lg font-bold ${colors.text.value}`}>
              {record.value}
            </span>
          </div>
          
          {/* Multiple record holders */}
          {record.holders.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              {record.holders.map((holder, holderIndex: number) => (
                <div key={holderIndex} className="border-t pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                    <span className="text-xs md:text-sm font-medium text-gray-600">Player:</span>
                    <span className={`font-semibold ${colors.text.title} text-sm md:text-base break-words`}>
                      {holder.playerName}
                    </span>
                  </div>
                  
                  {/* Show different info based on record type */}
                  {isTeamRecord(record) ? (
                    // Game record - show game info
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <span className="text-xs md:text-sm text-gray-600">vs {(holder as any).gameInfo.opponent}</span>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{(holder as any).gameInfo.result}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {(holder as any).gameInfo.date}
                      </div>
                    </div>
                  ) : isSeasonRecord(record) ? (
                    // Season record - show season info
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <span className="text-xs md:text-sm text-gray-600">Season:</span>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{(holder as any).season}</span>
                      </div>
                    </div>
                  ) : isAllTimeRecord(record) ? (
                    // All-time record - show just the achievement
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <span className="text-xs md:text-sm text-gray-600 italic">All-Time Achievement</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Show "Tied Record" badge if multiple holders */}
                  {record.holders.length > 1 && (
                    <div className="mt-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${colors.text.description} bg-white bg-opacity-50 leading-tight`}>
                        {holderIndex === 0 && record.holders.length > 1 ? `Tied with ${record.holders.length - 1} other${record.holders.length > 2 ? 's' : ''}` : 'Tied Record'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {recordSections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Accordion Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl md:text-2xl flex-shrink-0">{section.icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-blue-700 leading-tight break-words">{section.title}</h2>
                  <p className="text-xs md:text-sm text-blue-600 mt-1 leading-relaxed break-words">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs md:text-sm text-blue-600 font-medium whitespace-nowrap hidden sm:inline">
                  {section.records.filter(r => r.holders.length > 0).length} records
                </span>
                <svg
                  className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
                    openSection === section.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
          
          {/* Accordion Content */}
          {openSection === section.id && (
            <div className="p-4 md:p-6 bg-white">
              {section.records.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                  {section.records.map((record: AnyRecord, index: number) => renderRecord(record, index))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">No records available</div>
                  <div className="text-gray-400 text-sm mt-2">Play more games to establish records</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
