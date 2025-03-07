"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { AgentGrid } from "@/components/agent-grid";
import config from "@/config/config";
import { 
  User, 
  Network, 
  Code, 
  Search, 
  BarChart, 
  Shield, 
  Coins, 
  Cloud, 
  Settings 
} from 'lucide-react';
import { CategoryCard } from "./CategoryCard";

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
  categories: string[]; // Add this line
  tokenName: string; // Add this line
  tokenAddress: string; // Add this line
  totalSupply: number; // Add this line
  tokenSymbol: string; // Add this line
}


export default function AgentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState<string | null>("All Agents");

const handleCategoryClick = (categoryTitle: string) => {
  setSelectedCategory(categoryTitle);
};

const categories = [
  { title: "All Agents", icon: <User />, onClick: () => handleCategoryClick("All Agents") },
  { title: "Code Analysis", icon: <Network />, onClick: () => handleCategoryClick("Code Analysis") },
  { title: "Data Processing", icon: <Code />, onClick: () => handleCategoryClick("Data Processing") },
  { title: "Network Operations", icon: <Search />, onClick: () => handleCategoryClick("Network Operations") },
  { title: "Security Analysis", icon: <BarChart />, onClick: () => handleCategoryClick("Security Analysis") },
  { title: "Cloud Operations", icon: <Shield />, onClick: () => handleCategoryClick("Cloud Operations") },
  { title: "AI Processing", icon: <Coins />, onClick: () => handleCategoryClick("AI Processing") },
  { title: "Workflow Automation", icon: <Cloud />, onClick: () => handleCategoryClick("Workflow Automation") },
  { title: "System Operations", icon: <Settings />, onClick: () => handleCategoryClick("System Operations") },
  { title: "System", icon: <Settings />, onClick: () => handleCategoryClick("System") },
];




  useEffect(() => {
    console.log(" BASE_URL ", config.BASE_URL)
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const apiUrl = selectedCategory === "All Agents" 
          ? `${config.BASE_URL}/api/assistants?page=${currentPage}&limit=6` 
          : selectedCategory 
          ? `${config.BASE_URL}/api/assistants?category=${selectedCategory}` 
          : `${config.BASE_URL}/api/assistants?page=${currentPage}&limit=6`;

        const response = await axios.get<{
          pages: any;
          page: number;
          pagination: any; success: boolean; data: Agent[];  
        }>(apiUrl);
        
        if (response.data.success) {
          const sortedAgents = response.data.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAgents(sortedAgents);
          console.log("totalpages", response.data.pages)

          setTotalPages(response.data.pagination.pages);
          setCurrentPage(response.data.pagination.page);
          console.log("totalrecord", response.data.pagination.total)
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setErrorMessage("Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-primary">
       {/* <div className="min-h-screen bg-gradient-to-r from-[#2d1a0e] to-[#0c0c0c]"></div> */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="py-12 space-y-8 ">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Sonic Starter AI Agents</h1>
            <p className="text-lg text-primary max-w-2xl mx-auto">
              Explore AI agents designed to help with various tasks and projects,
              or create your own customized solution to fit your needs.
            </p>
          </div>
       
         
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <h3 className="text-lg font-semibold ">Categories</h3>
          <div className="grid grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard 
                key={category.title} 
                title={category.title} 
                icon={category.icon} 
                onClick={ () => setSelectedCategory(category.title)} 
                selected={selectedCategory === category.title}
              />
            ))}
          </div>
          <h3 className="text-lg font-semibold">All Agents</h3>
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
      </div>
    </div>
  );
}
