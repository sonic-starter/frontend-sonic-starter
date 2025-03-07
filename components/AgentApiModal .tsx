"use client";

import { FC, useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
      agentName: string;
      codename: string;
      roleDescription: string;
    };
  }

export const AgentApiModal: FC<ModalProps> = ({ isOpen, onClose , formData}) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState("Agent JSON");
  const [dynamicContent, setDynamicContent] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (activeTab === "Agent JSON") {
          // Construct the JSON content based on the formData
          const agentData = {
            name: formData.agentName,
            codename: formData.codename,
            roleDescription: formData.roleDescription,
            agent_role: "", // You can customize this as per your requirements
            agent_instructions: "", // Customize this as needed
            examples: null,  // You can populate this field
            features: [], // Customize as required
            tool: null, // Customize if needed
            tool_usage_description: null, // Add tool description if necessary
            provider_id: "", // Customize provider_id
            temperature: 0, // Example temperature setting
            top_p: 0, // Example top_p setting
            model: "", // Example model
          };
    
          // Convert the object into a formatted JSON string
          const jsonString = JSON.stringify(agentData, null, 2);
          setDynamicContent(jsonString); // Update dynamic content
        } else if (activeTab === "Interface") {
          // Set content for the Interface tab
          setDynamicContent(`create your agent first`);
        }
      }, [formData, activeTab]);

//     const updateDynamicContent = (tab: string) => {
//         if (tab === "Agent JSON") {
//             setDynamicContent(`{
//     "name": "react agent",
//     "description": "",
//     "agent_role": "",
//     "agent_instructions": "react app ",
//     "examples": null,
//     "features": [],
//     "tool": null,
//     "tool_usage_description": null,
//     "provider_id": "OpenAI",
//     "temperature": "0.7",
//     "top_p": "0.9",
//     "model": "gpt-4o-mini"
// }`);
//         } else if (tab === "Interface") {
//             setDynamicContent(`curl -X POST 'https://agentprod.studio.lyzr.ai/v3/inference/' 
//     -H 'Content-Type: application/json'
//     -H 'x-api-key: sk-defaultHscZqavArv1f8cxDBQb3XzMuhnVc3T'
//     -d '{
//     "user_id":"sstytcenko@gmail.com",
//     "agent_id":"6761bfda3b81ce3062def449",
//     "session_id":"6761bfda3b81ce3062def",
//     "message": " "
//     }'`);
//     setDynamicContent(`create your agent first`);
//         }
//     };

    const handleCopy = () => {
        if (dynamicContent) {
            navigator.clipboard
                .writeText(dynamicContent)
                .then(() => {
                    setIsCopied(true);
                    setTimeout(() => {
                        setIsCopied(false);
                    }, 1000);
                })
                .catch((err) => {
                    console.error("Error copying text: ", err);
                });
        }
    };

   
  const handleTabChange = (tab: string) => {
    setActiveTab(tab); // Simply update the active tab
  };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#242424] text-foreground rounded-lg shadow-lg w-[90%] max-w-lg p-6 relative overflow-hidden sm:w-[422px] sm:h-[470px] sm:p-7">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-foreground hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center mt-4 mb-6">
                    <h2 className="text-2xl font-semibold flex gap-2 items-center">
                        Agent API
                        <Image
                            src="/images/code.svg"
                            alt="code"
                            width={26}
                            height={13}
                        />
                    </h2>
                    <Button
                        variant="outline"
                        className="flex gap-1 bg-[#242424] text-white border-[#414141] rounded-md"
                        onClick={handleCopy}
                    >
                        {isCopied ? (
                            <>
                                <Check className="h-6 w-6" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Image
                                    src="/images/copy.svg"
                                    alt="copy"
                                    width={12}
                                    height={15}
                                    className="transition-all duration-300"
                                />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-[#2E2E2E] rounded-md p-1">
                    <button
                        className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            activeTab === "Agent JSON"
                                ? "bg-[#484848] text-foreground"
                                : "text-muted-foreground"
                        }`}
                        onClick={() => handleTabChange("Agent JSON")}
                    >
                        Agent JSON
                    </button>
                    <button
                        className={`flex-1 px-4 py-2 rounded-md ${
                            activeTab === "Interface"
                                ? "bg-[#484848] text-foreground"
                                : "text-muted-foreground"
                        }`}
                        onClick={() => handleTabChange("Interface")}
                    >
                        Interface
                    </button>
                </div>

                {/* Content Section with Scroll */}
                <div className="text-sm overflow-y-auto max-h-48 sm:max-h-64">
                    <div className="p-4 bg-[#2E2E2E] rounded-md">
                        <pre className="whitespace-pre-wrap break-words">
                            {dynamicContent}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
