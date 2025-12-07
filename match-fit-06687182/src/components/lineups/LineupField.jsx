
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function LineupField({ 
  formation, 
  positions, 
  startingLineup, 
  players, 
  onPositionClick, 
  onRemovePlayer,
  isEditable 
}) {
  const getPlayerAtPosition = (positionName) => {
    const assignment = startingLineup.find(p => p.position === positionName);
    if (!assignment) return null;
    return players.find(p => p.id === (assignment.player_id || assignment.player_email));
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden min-h-[500px] sm:min-h-0" style={{ paddingTop: "60%" }}>
      {/* Field lines */}
      <div className="absolute inset-0">
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-16 h-16 md:w-20 md:h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Penalty boxes */}
        <div className="absolute top-0 left-1/4 right-1/4 h-12 md:h-14 border-2 border-white/40 border-t-0"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-12 md:h-14 border-2 border-white/40 border-b-0"></div>
        
        {/* 6-yard boxes */}
        <div className="absolute top-0 left-[37.5%] right-[37.5%] h-6 md:h-7 border-2 border-white/40 border-t-0"></div>
        <div className="absolute bottom-0 left-[37.5%] right-[37.5%] h-6 md:h-7 border-2 border-white/40 border-b-0"></div>
      </div>

      {/* Player positions */}
      {positions.map((pos) => {
        const player = getPlayerAtPosition(pos.name);
        
        return (
          <div
            key={pos.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            {player ? (
              <div className="relative group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex flex-col items-center justify-center border-2 md:border-4 border-[var(--primary-main)]">
                  <span className="text-xs md:text-base font-bold text-[var(--primary-main)]">
                    {player.jersey_number}
                  </span>
                </div>
                <div className="absolute -bottom-4 md:-bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-white px-1.5 md:px-2 py-0.5 rounded shadow-md text-[8px] md:text-[9px] font-medium max-w-[80px] md:max-w-none truncate">
                    {player.first_name && player.last_name 
                      ? `${player.first_name} ${player.last_name}` 
                      : (player.email || `Player ${player.id.slice(0, 8)}`)}
                  </div>
                </div>
                {isEditable && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemovePlayer(pos.name)}
                  >
                    <X className="w-2 h-2 md:w-2.5 md:h-2.5" />
                  </Button>
                )}
              </div>
            ) : (
              <button
                onClick={() => isEditable && onPositionClick(pos.name)}
                className={`w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full shadow-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-400 ${
                  isEditable ? 'hover:border-[var(--primary-main)] hover:bg-white cursor-pointer' : 'cursor-default'
                } transition-all`}
                disabled={!isEditable}
              >
                {isEditable && <Plus className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />}
                <span className="text-[7px] md:text-[8px] text-gray-600 font-medium mt-0.5">{pos.name}</span>
              </button>
            )}
            {!player && (
              <div className="absolute -bottom-4 md:-bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/90 px-1.5 md:px-2 py-0.5 rounded shadow-sm text-[8px] md:text-[9px] font-medium text-gray-600">
                  {pos.label}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
