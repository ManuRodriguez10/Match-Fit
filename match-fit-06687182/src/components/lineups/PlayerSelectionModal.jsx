import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

export default function PlayerSelectionModal({ players, assignedPlayers, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  const availablePlayers = players.filter(p => !assignedPlayers.has(p.email));
  
  const filteredPlayers = availablePlayers.filter(player => {
    const playerName = player.first_name && player.last_name 
      ? `${player.first_name} ${player.last_name}` 
      : player.email;
    
    return playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.jersey_number?.toString().includes(searchTerm);
  });

  // Group players by position
  const groupedPlayers = {
    goalkeeper: filteredPlayers.filter(p => p.position === "goalkeeper"),
    defender: filteredPlayers.filter(p => p.position === "defender"),
    midfielder: filteredPlayers.filter(p => p.position === "midfielder"),
    forward: filteredPlayers.filter(p => p.position === "forward")
  };

  const positionLabels = {
    goalkeeper: "Goalkeepers",
    defender: "Defenders",
    midfielder: "Midfielders",
    forward: "Forwards"
  };

  const renderPlayerButton = (player) => (
    <button
      key={player.id}
      onClick={() => onSelect(player.email)}
      className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 hover:border-[var(--primary-main)] transition-all text-left"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {player.jersey_number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">
          {player.first_name && player.last_name 
            ? `${player.first_name} ${player.last_name}` 
            : player.email}
        </h3>
        <p className="text-sm text-gray-600 capitalize">{player.position}</p>
      </div>
      <div className="text-sm text-gray-500">
        #{player.jersey_number}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Select Player</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, position, or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6">
            {filteredPlayers.length > 0 ? (
              <>
                {Object.entries(groupedPlayers).map(([position, positionPlayers]) => 
                  positionPlayers.length > 0 ? (
                    <div key={position}>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 sticky top-0 bg-white py-2 z-10">
                        {positionLabels[position]} ({positionPlayers.length})
                      </h3>
                      <div className="space-y-2">
                        {positionPlayers.map(renderPlayerButton)}
                      </div>
                    </div>
                  ) : null
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {availablePlayers.length === 0 
                  ? "All players have been assigned"
                  : "No players match your search"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}