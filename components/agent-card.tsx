"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, SquarePen, Twitter } from "lucide-react";
import { usePathname } from "next/navigation";
// import { Button } from "./ui/button";

interface AgentCardProps {
  agent: {
    _id: string;
    name: string;
    codeName: string;
    instructions: string;
    isActive: boolean;
    imageUrl: string;
    categories: string[];
    tokenName: string,
    tokenAddress: string,
    totalSupply: number,
    tokenSymbol: string,

  };
}

const capitalizeFirstLetter = (string?: string) => {
  if (!string) return ""; // Return an empty string if undefined or empty
  return string.charAt(0).toUpperCase() + string.slice(1);
};


const capitalizeEachWord = (string: string) => {
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const capitalizeFirstCharOfEachSentence = (string: string) => {
  return string
    .split('. ')
    .map(sentence => capitalizeFirstLetter(sentence))
    .join('. ');
};

export default function AgentCard({ agent }: AgentCardProps) {
  const pathname = usePathname();
  const id = agent._id;

  return (
    <div className="relative ">
      <Link
        href={{
          pathname: "/agentdetail",
          query: { id },
        }}
      >
        <Card className="group relative overflow-hidden bg-lightbg border border-primary text-primary cursor-pointer p-4">
          <div className="flex items-start gap-2">
            <div
              className="h-16 w-16 flex items-center justify-center overflow-hidden mr-4"
              style={{ position: "relative" }}
            >
              <Image
                src={agent.imageUrl || "/images/agent_6.svg"}
                alt={agent.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-col flex items-start">
              <div className="flex justify-between mb-2">
                <Badge
                  variant="outline"
                  className={`flex items-center  border border-primary/60 text-primary/60  gap-2 ${agent.isActive ? "" : ""}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${agent.isActive ? "bg-primary" : "bg-gray-400"}`}
                  ></span>
                  {agent.isActive ? "Active" : "Inactive"}
                </Badge>
                {/* <span className="text-lg">{agent.arata} ARATA</span> */}
              </div>
              <h3 className="font-semibold text-lg ">{capitalizeEachWord(agent.name)}</h3>
              <p className="text-sm ">Codename: {capitalizeFirstLetter(agent.codeName)}</p>
              <p className="text-sm ">
                {agent.instructions.length > 35
                  ? `${capitalizeFirstCharOfEachSentence(agent.instructions.substring(0, 35))}...`
                  : capitalizeFirstCharOfEachSentence(agent.instructions)}
              </p>

              <div className="flex justify-between gap-3">

                <div className="flex gap-2 mt-2">
                  <button className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group">
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>


                {pathname === "/myagents" && (
                  <div className="  mt-3">
                    <Link
                      href={{
                        pathname: "/create",
                        query: { id: agent._id },
                      }}
                    >
                      <button className="bg-primary px-3 py-1 rounded-lg text-sm text-black flex  items-center gap-2">
                        <SquarePen className="w-4 h-4" />
                        Edit
                      </button>
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </div>

        </Card>
      </Link>
    </div>
  );
}
