"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { AgentGrid } from "@/components/agent-grid";
import config from "@/config/config";
import { usePrivy } from "@privy-io/react-auth";
import { Copyright } from "lucide-react";



interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  isActive: boolean;
  imageUrl: string;
  categories: string[] ;
  tokenName: string,
  tokenAddress: string,
  totalSupply: number,
  tokenSymbol: string,
}

export default function MyAgents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { authenticated, login, logout, user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  useEffect(() => {
    console.log("walletaddress........", walletAddress);
  
    const fetchMyAgents = async () => {
      try {
        const response = await axios.get<{
          pages: any;
          page: number;
          pagination: any; success: boolean; data: Agent[];  
}>(
          `${config.BASE_URL}/api/assistants/address/${walletAddress}?page=${currentPage}&limit=6`
        );
        if (response.data.success) {
          // console.log("list of my agents", response.data);
          setAgents(response.data.data);
          setTotalPages(response.data.pagination.pages);
          setCurrentPage(response.data.pagination.page);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setErrorMessage("Failed to fetch your agents");
      } finally {
        setLoading(false);
      }
    };
  
    if (walletAddress) {
      fetchMyAgents();
    }
  }, [walletAddress , currentPage]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="h-screen flex bg-gradient-to-br from-darkStart to-darkEnd text-white overflow-hidden">
    {/* Sidebar */}
   

    {/* Main Content */}
    <main className="ml-64 flex-1 px-10 py-6 overflow-auto">
        
        <div className=" space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary">My Agents</h1>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <AgentGrid
            searchQuery={searchQuery}
            agents={agents}
            loading={loading}
            errorMessage={errorMessage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}
