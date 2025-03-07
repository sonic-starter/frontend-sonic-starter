"use client";

import AgentCard from "@/components/agent-card";
import { Agent } from "@/types/agent";

import { PaginationC } from "./ui/PaginationC";

interface AgentGridProps {
  searchQuery: string;
  agents: Agent[];
  loading: boolean;
  errorMessage: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AgentGrid({
  searchQuery,
  agents,
  loading,
  errorMessage,
  currentPage,
  totalPages,
  onPageChange,
}: AgentGridProps) {
  const filteredAgents = agents.filter((agent) => {
    const searchTerm = searchQuery.toLowerCase();
    return [agent.name, agent.codeName, agent.instructions]
      .some((field) => (field || "").toLowerCase().includes(searchTerm));
  });

  return (
    
    <div className="relative ">
   
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {!loading && agents.length > 0 && filteredAgents.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No agents found matching your search. Please try a different query.
        </p>
      )}
      {!loading && agents.length === 0 && !errorMessage && (
        <p className="text-center text-muted-foreground mt-8">
          No agents available at the moment.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent._id} agent={agent} />
        ))}
      </div>
      <PaginationC
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
