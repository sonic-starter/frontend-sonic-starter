"use client";

import AgentCard from "@/components/agent-card";
import { Agent } from "@/types/agent";
import { PaginationC } from "./ui/PaginationC";
import Link from "next/link";
import Image from "next/image";

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
    <div className="relative overflow-x-auto p-4 bg-darkStart rounded-lg shadow-lg">
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {!loading && agents.length > 0 && filteredAgents.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No agents found matching your search. Please try a different query.
        </p>
      )}
      
      <table className="w-full text-left border border-borderColor rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-darkStart to-darkEnd text-primary border-b border-borderColor">
            <th className="p-4">Agent</th>
            <th className="p-4">Codename</th>
            <th className="p-4">Status</th>
            <th className="p-4">Instructions</th>
            <th className="p-4">Token Name</th>
            <th className="p-4">Total Supply</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAgents.map((agent) => (
            <tr key={agent._id} className="border-b border-borderColor hover:bg-darkEnd transition">
              <td className="p-4 flex items-center gap-3">
                <Image
                  src={agent.imageUrl || "/images/default-agent.png"}
                  alt={agent.name}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <span className="font-medium">{agent.name}</span>
              </td>
              <td className="p-4">{agent.codeName}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    agent.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}
                >
                  {agent.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-4 truncate max-w-xs">{agent.instructions}</td>
              <td className="p-4">{agent.tokenName}</td>
              <td className="p-4">{agent.totalSupply.toLocaleString()}</td>
              <td className="p-4">
                <Link href={{ pathname: "/agentdetail", query: { id: agent._id } }}>
                  <button className="bg-primary px-4 py-2 rounded-lg text-sm text-black font-medium hover:bg-primary/80 transition">
                    View
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && agents.length === 0 && !errorMessage && (
        <p className="text-center text-muted-foreground mt-8">
          No agents available at the moment.
        </p>
      )}
      <PaginationC
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
