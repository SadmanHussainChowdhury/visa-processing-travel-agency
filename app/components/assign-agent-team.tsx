'use client';

import { useState, useEffect } from 'react';
import { Users, User, Briefcase, Search } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Team {
  id: string;
  name: string;
  members: string[]; // IDs of agents in the team
  status: 'active' | 'inactive';
}

interface AssignAgentTeamProps {
  currentAgentId?: string;
  currentTeamId?: string;
  onAgentChange: (agentId: string) => void;
  onTeamChange: (teamId: string) => void;
}

export default function AssignAgentTeam({
  currentAgentId,
  currentTeamId,
  onAgentChange,
  onTeamChange
}: AssignAgentTeamProps) {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'agent1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Senior Agent', status: 'active' },
    { id: 'agent2', name: 'Michael Chen', email: 'michael@example.com', role: 'Senior Agent', status: 'active' },
    { id: 'agent3', name: 'Emma Rodriguez', email: 'emma@example.com', role: 'Junior Agent', status: 'active' },
    { id: 'agent4', name: 'David Kim', email: 'david@example.com', role: 'Compliance Officer', status: 'active' },
  ]);
  
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team1', name: 'North America Team', members: ['agent1', 'agent2'], status: 'active' },
    { id: 'team2', name: 'Europe Team', members: ['agent3', 'agent4'], status: 'active' },
    { id: 'team3', name: 'Asia Pacific Team', members: ['agent1', 'agent3'], status: 'active' },
    { id: 'team4', name: 'Processing Team', members: ['agent2', 'agent4'], status: 'active' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Filter agents based on search term
    const filtered = agents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(filtered);
    
    // Filter teams based on search term
    const filteredT = teams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filteredT);
  }, [searchTerm, agents, teams]);

  const handleAgentSelect = (agentId: string) => {
    onAgentChange(agentId);
    setShowAgentDropdown(false);
    setSearchTerm('');
  };

  const handleTeamSelect = (teamId: string) => {
    onTeamChange(teamId);
    setShowTeamDropdown(false);
    setSearchTerm('');
  };

  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  const getTeamById = (id: string) => {
    return teams.find(team => team.id === id);
  };

  return (
    <div className="space-y-4">
      {/* Assign Agent */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Agent
        </label>
        
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => {
              setShowAgentDropdown(!showAgentDropdown);
              setShowTeamDropdown(false);
            }}
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-700">
                {currentAgentId ? getAgentById(currentAgentId)?.name : 'Select an agent'}
              </span>
            </div>
            <svg 
              className={`h-4 w-4 text-gray-400 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {showAgentDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <div
                      key={agent.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                        currentAgentId === agent.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleAgentSelect(agent.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.role}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No agents found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Assign Team */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Team
        </label>
        
        <div className="relative">
          <div 
            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => {
              setShowTeamDropdown(!showTeamDropdown);
              setShowAgentDropdown(false);
            }}
          >
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-700">
                {currentTeamId ? getTeamById(currentTeamId)?.name : 'Select a team'}
              </span>
            </div>
            <svg 
              className={`h-4 w-4 text-gray-400 transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {showTeamDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <div
                      key={team.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                        currentTeamId === team.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleTeamSelect(team.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{team.name}</div>
                          <div className="text-xs text-gray-500">{team.members.length} members</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No teams found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}