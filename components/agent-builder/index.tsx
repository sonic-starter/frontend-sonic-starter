"use client";

import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, Upload, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DraggableFunction } from "./draggable-function";
import { DropZone } from "./drop-zone";
import { Label } from "../ui/label";
import Image from "next/image";
import { Header } from "../ui/header";
import axios from "axios";
import config from "@/config/config";
import { FunctionContext } from '../../contexts/FunctionContext';
import { usePrivy } from "@privy-io/react-auth";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AgentApiModal } from "../AgentApiModal ";
import { ethers } from "ethers";
import abi_erc20 from "@/config/abi_erc20.json";
import Modal from "../Modal";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "../ui/card";
import { Bot, Code, Shield, Brain, Cloud, Workflow, Settings } from "lucide-react";


export interface AgentFunction {
  id: string;
  name: string;
  description: string;
  type: "text" | "vision" | "decision";
}

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  imageUrl: string;
}




const llmProviders = {
  openai: ["gpt-4", "gpt-3.5-turbo", "gpt-4-1106-preview"],
  // google: ["gemini-pro", "gemini-flash"],
};

export default function AgentBuilder({ agentId }: any) {


  const [formData, setFormData] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    llmProvider: "",
    llmModel: "",
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [isGinModalOpen, setIsGinModalOpen] = useState<boolean>(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const { authenticated, login, logout, user } = usePrivy();


  const router = useRouter();
  const { jwtToken } = useAuth();
  const walletAddress = user?.wallet?.address;

  const [selectedFunction, setSelectedFunction] = useState<string[]>([]);
  const [tokenDetails, setTokenDetails] = useState<{ name: string; symbol: string; supply: string }>({
    name: "",
    symbol: "",
    supply: "",
  });

  const agentFunctions = [
    { icon: Code, label: "Code Analysis" },
    { icon: Shield , label: "Data Processing" },
    { icon: Shield, label: "Network Operations" },
    { icon: Brain, label: "Security Analysis" },
    { icon: Cloud, label: "AI Processing" },
    { icon: Workflow, label: "Cloud Operations" },
    { icon: Settings, label: "Workflow Automation" },
    { icon: Settings, label: "System Operations" },
  ];

  console.log("jwt token in agent builder.....", jwtToken);


  const functionContext = useContext(FunctionContext);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toFixed(2);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !walletAddress) return;

      try {
        // Create a provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(config.ERC20_CONTRACT_ADDRESS, abi_erc20, provider);

        // Call the balanceOf function
        const balance = await contract.balanceOf(walletAddress);
        setBalance(ethers.utils.formatUnits(balance, 18)); // Format the balance
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [authenticated, walletAddress]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return; // Only fetch if id is available

      try {
        const agentResponse = await axios.get(`${config.BASE_URL}/api/assistants/${agentId}`);
        if (agentResponse.data.success) {
          const agentData = agentResponse.data.data;

          // Set form fields
          setFormData({
            agentName: agentData.name || "",
            codename: agentData.codeName || "",
            roleDescription: agentData.instructions || "",
            llmProvider: agentData.llmProvider || "",
            llmModel: agentData.llmModel || "",
          });

          setUserAddress(agentData.userAddress);

           // Set additional fields
      setTokenDetails({
        name: agentData.tokenName || "",
        symbol: agentData.tokenSymbol || "",
        supply: agentData.totalSupply?.toString() || "",
      });
      setSelectedFunction(agentData.categories || []); 

          // Set avatar URL directly
          if (agentData.imageUrl) {
            setPreviewUrl(agentData.imageUrl); // Set the avatar URL for preview
          } else {
            setPreviewUrl(null); // Reset if no avatar
          }

        
          console.log("Agent detail for update:", agentData);
        } else {
          console.error("Error fetching agent details:", agentResponse.data.message);
        }
      } catch (error) {
        console.error("Failed to fetch details:", error);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  const handleUpdate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      let avatarUrl = previewUrl; // Start with previewUrl if available

      // If a new avatar is selected (File type), process it with Pinata
      if (avatar && typeof avatar !== "string") {
        const avatarHash = await uploadToPinata(avatar); // Upload new avatar to Pinata
        avatarUrl = `https://gateway.pinata.cloud/ipfs/${avatarHash}`;
      }

      console.log("Using avatar URL:", avatarUrl);

  

      // Send the updated data to your API
      const agentResponse = await axios.put(`${config.BASE_URL}/api/assistants/${agentId}`, {
        name: formData.agentName, // Use formData fields
        instructions: formData.roleDescription,
        codeName: formData.codename,
        imageUrl: avatarUrl, // Use avatarUrl which is either previewUrl or new Pinata URL
        createdBy: userAddress,
        // availableFunctions: availableFunctions,
        userAddress: userAddress,
        llmModel: formData.llmModel,
        llmProvider: formData.llmProvider,
        categories: selectedFunction,
        tokenName: tokenDetails.name,
        totalSupply: tokenDetails.supply,
        tokenSymbol: tokenDetails.symbol,
        model: "gpt-4",
        
      });

      console.log("Agent updated successfully:", agentResponse.data);
      router.push("/myagents"); // Redirect after successful update
    } catch (error) {
      console.error("Error updating agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const [errors, setErrors] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    // avatar: "",
    // functions: "",
    llmModel: "",
    llmProvider: "",
  });

  
  const handleBackClick = () => {
    router.back();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear corresponding error message
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() ? "" : `${field} is required.`,
    }));

    // Update token details for token preview
    if (field === "tokenName") {
      setTokenDetails((prev) => ({ ...prev, name: value }));
    } else if (field === "tokensymbol") {
      setTokenDetails((prev) => ({ ...prev, symbol: value }));
    } else if (field === "tokenSupply") {
      setTokenDetails((prev) => ({ ...prev, supply: value }));
    }
  };

  // Function to trigger the file input dialog
  const handleIconClick = () => {
    fileInputRef.current?.click(); // Trigger the file input dialog programmatically
  };


  // Log values or display them
  // console.log('Function Mappings:', functionMappings);

  const pinataApiKey = `${config.PINATA_API_KEY}`;
  const pinataSecretApiKey = `${config.PINATA_API_SECRET}`;

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const toggleGinTokenModal = () => {
    setIsGinModalOpen(!isGinModalOpen);
  };




  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file); // Set the selected file
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null); // Remove the selected avatar file
    setPreviewUrl(null); // Clear the preview URL
  };


  useEffect(() => {
    // Cleanup the object URL when the avatar changes or component unmounts
    return () => {
      if (avatar instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(avatar));
      }
    };
  }, [avatar]);

  const uploadToPinata = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: "AgentAvatar",
      keyvalues: {
        uploadedBy: "AgentBuilder",
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    try {
      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      throw new Error("Failed to upload image");
    }
  };

  const validateFields = () => {
    const newErrors = {
      agentName: formData.agentName.trim() ? "" : "Agent name is required.",
      codename: formData.codename.trim() ? "" : "Codename is required.",
      roleDescription: formData.roleDescription.trim() ? "" : "Role description is required.",
      llmModel: formData.llmModel.trim() ? "" : "LLM model is required.", // Added validation
      llmProvider: formData.llmProvider.trim() ? "" : "LLM provider is required.", // Added validation
      // avatar: avatar ? "" : "Avatar upload is required.",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const [isCreating, setIsCreating] = useState<boolean>(false); // New state to manage input disable

  const handleCreate = async () => {
    // if (!validateFields()) return; // Check if fields are valid before proceeding

    setIsCreating(true); // Disable inputs when creating the agent

   

    setLoading(true); // Set loading state only after validation
    try {

      
      // Payment process
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const erc20Contract = new ethers.Contract(config.ERC20_CONTRACT_ADDRESS, abi_erc20, signer);

      const adminAddress = config.GINTONIC_CONTRACT_ADDRESS; // Replace with the actual admin address
      const ginAmount = ethers.utils.parseUnits('500', 18); // 500 GIN

      const tx = await erc20Contract.transfer(adminAddress, ginAmount);
      console.log('Transaction sent, waiting for confirmation...');
      await tx.wait();

      console.log('Payment successful');
      toast.success('Payment successful! Creating agent.');


      // Proceed with agent creation
      let avatarUrl = "";

      // If an avatar is selected, upload it and generate the URL
      if (avatar) {
        const avatarHash = await uploadToPinata(avatar);
        avatarUrl = `https://gateway.pinata.cloud/ipfs/${avatarHash}`;
      }

 

      // Send the data to your API
      const agentResponse = await axios.post(
        `${config.BASE_URL}/api/assistants`,
        {
          name: formData.agentName,
          instructions: formData.roleDescription,
          codeName: formData.codename,
          imageUrl: avatarUrl,
          createdBy: walletAddress,
          llmModel: formData.llmModel,
          llmProvider: formData.llmProvider,
          userAddress: walletAddress,
          // openaiAssistantId: "openai-assistant-id",
          categories: selectedFunction,
          tokenName: tokenDetails.name,
          tokenAddress: "0xTokenAddress",
          totalSupply: tokenDetails.supply,
          tokenSymbol: tokenDetails.symbol,
          model: "gpt-4",
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,  
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Agent created successfully:', agentResponse.data);
      toast.success('Agent created successfully! Redirecting to your agents page.');

      // Add a small delay before redirecting to ensure the user sees the toast
      setTimeout(() => {
        router.push('/myagents');
      }, 0); // Redirect after successful creation
    } catch (error) {
      console.error('Error during payment or agent creation:', error);
      toast.error('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
      setIsCreating(false); // Re-enable inputs after creation
    }
  };

  const handleFunctionSelect = (func: { label: string }) => {
    setSelectedFunction(prev => 
        prev.includes(func.label) 
            ? prev.filter(label => label !== func.label) // Deselect if already selected
            : [...prev, func.label] // Select if not already selected
    );
  };

 

  return (
    <div className="min-h-screen bg-background">
      {loading && (
        <div className=" inset-0 flex justify-center items-center bg-opacity-50 bg-black z-50 mt-24">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      )}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

        <Header />
        <button onClick={handleBackClick} className="text-primary ">
              <div className="flex items-center gap-4">
                <ArrowLeft className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Back</h1>
              </div>
            </button>
        <div className="space-y-4 text-center pt-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary">AI Agents BUILDER</h1>
         
        </div>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Agent Details */}
          <div className="space-y-6">
            <Card className="p-6 bg-black/40 border border-green-500/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-primary mb-4">Agent Details</h2>
              <Label className="mt-4 text-md text-primary ">Agent Name</Label>
              <Input
                placeholder="Agent name"
                value={formData.agentName}
                onChange={(e) => handleChange("agentName", e.target.value)}

              />

              {errors.agentName && <p className="text-red-500 text-sm mt-1">{errors.agentName}</p>}
              <br />
              <Label className="mt-4 text-md text-primary">Codename</Label>
              <Input
                placeholder="Codename"
                value={formData.codename}
                onChange={(e) => handleChange("codename", e.target.value)}
              />

              {errors.codename && <p className="text-red-500 text-sm mt-1">{errors.codename}</p>}
              <br />
            <Label className="mt-4 text-md text-primary">LLM Provider</Label>
            <select
              value={formData.llmProvider}
              onChange={(e) => handleChange("llmProvider", e.target.value)}
              className="block w-full rounded-md mt-2 text-primary bg-black/50 border border-green-500/30  px-3 py-2 outline-none"
            >
              <option value="" className="text-primary">Select Provider</option>
              {Object.keys(llmProviders).map((provider) => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>

            {errors.llmProvider && <p className="text-red-500 text-sm mt-1">{errors.llmProvider}</p>}
            <br />
            <Label className="mt-4 text-md text-primary">LLM Model</Label>
            <select
              value={formData.llmModel}
              onChange={(e) => handleChange("llmModel", e.target.value)}
              className="block w-full rounded-md mt-2 bg-black/50 border border-green-500/30 text-green-500 px-3 py-2 outline-none"
              disabled={!formData.llmProvider} // Disable if no provider is selected
            >
              <option value="">Select Model</option>
              {formData.llmProvider && llmProviders[formData.llmProvider as keyof typeof llmProviders].map((model: string) => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </option>
              ))}
            </select>

            {errors.llmModel && <p className="text-red-500 text-sm mt-1">{errors.llmModel}</p>}
              <br />
              <Label className="mt-4 text-md text-primary">Role Description</Label>
              <Input
                placeholder="Describe agent's role and capabilities"
                className="h-10"
                value={formData.roleDescription}
                onChange={(e) => handleChange("roleDescription", e.target.value)}
              />

              {errors.roleDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.roleDescription}</p>
              )}

              <div className="flex items-center gap-2 pt-4 overflow-hidden">
                <div
                  className="h-12 w-12 rounded-md p-2 bg-black/50 border border-green-500/30 text-green-500 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={handleIconClick} // Trigger the file input dialog when clicking the div
                >
                  {avatar || previewUrl ? (
                    <img
                      src={previewUrl || (avatar instanceof File ? URL.createObjectURL(avatar) : "")}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Upload className="text-green-500" width={24} height={24} />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-foreground text-green-500 cursor-pointer text-lg" onClick={handleIconClick}>
                    Upload AI Avatar
                  </p>
                  {(avatar || previewUrl) ? (
                    <div className="flex items-center gap-2">
                      <p className="text-green-500">
                        {avatar
                          ? avatar.name.length > 6
                            ? `${avatar.name.slice(0, 7)}.${avatar.name.split(".").pop()}`
                            : avatar.name
                          : previewUrl && previewUrl.length > 6
                            ? `${previewUrl.slice(0, 9)}`
                            : previewUrl}
                      </p>
                      <button onClick={handleRemoveAvatar} className="text-green-500">✖</button>
                    </div>
                  ) : (
                    <input
                      ref={fileInputRef} // Assign the ref to the input element
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden" // Hide the input field
                    />
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/40 border border-green-500/20 backdrop-blur">
              <h2 className="text-green-500 text-xl mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Agent Functions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {agentFunctions.map((func, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400 justify-start ${selectedFunction.includes(func.label) ? 'bg-green-500/10' : ''}`}
                    onClick={() => handleFunctionSelect(func)}
                  >
                    <func.icon className="w-4 h-4 mr-2" />
                    {func.label}
                  </Button>
                ))}
              </div>
              {selectedFunction.length > 0 && (
                <p className="mt-4 text-green-500 text-lg">Selected Functions: {selectedFunction.join(', ')}</p>
              )}
            </Card>


            <Card className="p-6 bg-black/40 border border-green-500/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-primary mb-4">Token Configuration</h2>
              <Label className="mt-4 text-md text-primary ">Token Name</Label>
              <Input
                placeholder="Token name"
                value={tokenDetails.name}
                onChange={(e) => handleChange("tokenName", e.target.value)}
                className="placeholder:text-primary"
              />

              {/* {errors.agentName && <p className="text-red-500 text-sm mt-1">{errors.agentName}</p>} */}
              <br />
              <Label className="mt-4 text-md text-primary">Ticker Symbol</Label>
              <Input
                placeholder="Token Symbol"
                value={tokenDetails.symbol}
                onChange={(e) => handleChange("tokensymbol", e.target.value)}
                className="placeholder:text-primary"
              />

              {/* {errors.codename && <p className="text-red-500 text-sm mt-1">{errors.codename}</p>} */}

              <br />
              <Label className="mt-4 text-md text-primary">Total Supply</Label>
              <Input
                type="number"
                placeholder="Total Supply"
                value={tokenDetails.supply}
                onChange={(e) => handleChange("tokenSupply", e.target.value)}
                className="placeholder:text-primary h-10"
              />

              {/* {errors.roleDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.roleDescription}</p>
              )} */}


            </Card>
          </div>

          {/* Right Side - Agent Preview and Token Preview */}
          <div className="space-y-6">
            {/* Agent Preview */}
            <Card className="p-6 border border-green-500/20 backdrop-blur">
              <h2 className="text-green-500 text-xl mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5" /> Agent Preview
              </h2>
              <div className="bg-black/60 p-4 rounded-lg border border-green-500/30">
                <div className="flex items-start gap-4">
                  <Bot className="w-12 h-12 text-green-500" />
                  <div>
                    <h3 className="text-green-500 text-lg">{formData.agentName || "Agent Name"}</h3>
                    <p className="text-green-500/70 text-sm">Codename: {formData.codename || "CODENAME"}</p>
                    <p className="text-green-500/70 text-sm mt-2">{formData.roleDescription || "Agent role and description"}</p>
                    {selectedFunction.length > 0 && (
                      <p className="text-green-500/70 text-sm mt-2">Functions: {selectedFunction.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Token Preview */}
            <Card className="p-6 bg-black/40 border border-green-500/20 backdrop-blur">
              <h2 className="text-green-500 text-xl mb-6 flex items-center gap-2">
                <Cloud className="w-5 h-5" /> Token Preview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-black/60 rounded-lg border border-green-500/30">
                  <span className="text-green-500">Token Name: {tokenDetails.name || "Token Name"}</span>
                  <span className="text-green-500">Symbol: {tokenDetails.symbol || "SYMBOL"}</span>
                </div>
                <div>
                  <label className="text-green-500 text-sm mb-2 block">Total Supply: {tokenDetails.supply || "0"}</label>
                  <Input
                    placeholder="Enter supply amount"
                    className="bg-black/50 border-green-500/30 text-green-500 placeholder:text-green-500/50"
                    value={tokenDetails.supply}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, supply: e.target.value })}
                  />
                </div>

                
      {/* <button onClick={handleTransaction} 
       className="w-full bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400">Initialize</button>

<button onClick={RegisterToken}  
className="w-full bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400">
  RegisterToken
  
  </button> */}

              </div>
            </Card>


        

            <div className="rounded-lg">
              <p className="text-sm text-green-400/60 text-center">
                Agent Cost: 500 GIN
              </p>

              {agentId ? (
                <Button
                  className="w-full mt-4 bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400 flex gap-1"
                  onClick={handleUpdate} // Function to handle the update action
                  disabled={loading} // Disable the button while loading
                >
                  {loading ? "Updating..." : "Update Agent"}
                </Button>
              ) : authenticated ? (
                <>
                  {parseFloat(balance) >= 500 ? (
                    <Button
                      className="w-full mt-4 bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                      onClick={handleCreate}
                      disabled={loading}
                    >

                      {loading ? "Creating..." : "Create Agent"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full mt-4 bg-black/50 border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400 flex gap-1"
                      onClick={toggleGinTokenModal} // Function to handle adding tokens
                    >

                      Add Token
                    </Button>
                  )}
                  {responseMessage && (
                    <p className="text-center text-sm mt-2 text-primary">
                      {responseMessage}
                    </p>
                  )}
                </>
              ) : (
                <Button
                  className="w-full bg-primary mt-4 text-primary-foreground hover:bg-primary/90 flex gap-1"
                  onClick={login}
                >
                  <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
                  Connect MetaMask
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      <AgentApiModal isOpen={isModalOpen} onClose={toggleModal} formData={formData} />

      {isGinModalOpen && <Modal isOpen={isGinModalOpen} onClose={toggleGinTokenModal} />}

    </div>  

  );
}


