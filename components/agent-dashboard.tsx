"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { AgentGrid } from "@/components/agent-grid";
import { CategoryCard } from "./CategoryCard";

import {
  User,
  Network,
  Code,
  Search,
  BarChart,
  Shield,
  Coins,
  Cloud,
  Settings,
} from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  isActive: boolean;
  imageUrl: string;
  createdAt: string;
  categories: string[];
  tokenName: string;
  tokenAddress: string;
  totalSupply: number;
  tokenSymbol: string;
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
    { title: "All Agents", icon: <User /> },
    { title: "Code Analysis", icon: <Network /> },
    { title: "Data Processing", icon: <Code /> },
    { title: "Network Operations", icon: <Search /> },
    { title: "Security Analysis", icon: <BarChart /> },
    { title: "Cloud Operations", icon: <Shield /> },
    { title: "AI Processing", icon: <Coins /> },
    { title: "Workflow Automation", icon: <Cloud /> },
    { title: "System Operations", icon: <Settings /> },
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const apiUrl =
          selectedCategory === "All Agents"
            ? `${config.BASE_URL}/api/assistants?page=${currentPage}&limit=6`
            : `${config.BASE_URL}/api/assistants?category=${selectedCategory}`;

        const response = await axios.get<{
          pages: any;
          page: number;
          pagination: any;
          success: boolean;
          data: Agent[];
        }>(apiUrl);

        if (response.data.success) {
          const sortedAgents = response.data.data.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAgents(sortedAgents);
          setTotalPages(response.data.pagination.pages);
          setCurrentPage(response.data.pagination.page);
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

  return (
    <div className="h-screen flex bg-gradient-to-br from-darkStart to-darkEnd text-white overflow-hidden">
      {/* Sidebar */}
     
      {/* Main Content */}
      <main className="ml-64 flex-1 px-10 py-6 overflow-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Hedera Starter AI Agents</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-2">
            Explore AI agents designed for various tasks and projects, or create your own customized solutions.
          </p>
        </div>

        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <h3 className="text-lg font-semibold text-gray-300">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              icon={category.icon}
              onClick={() => setSelectedCategory(category.title)}
              selected={selectedCategory === category.title}
            />
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Available Agents</h3>
          <AgentGrid
            searchQuery={searchQuery}
            agents={agents}
            loading={loading}
            errorMessage={errorMessage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

      </main>
    </div>
  );
}
