"use client";

import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, Upload, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import abi_token_bonding_curve_factory from "@/config/abi_Fectory_Bonding_Curve.json";
import abi_token_bonding_curve from "@/config/abi_Bonding_curve.json";
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

export default function CreateAgent({ agentId }: any) {


  const [formData, setFormData] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    llmProvider: "",
    llmModel: "",
    abi: "",
    contractAddress: "",
    agentPurpose: "",
    instructions: "",
    tags: "",
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
            abi: agentData.abi || "",
            contractAddress: agentData.contractAddress || "",
            agentPurpose: agentData.agentPurpose || "",
            instructions: agentData.instructions || "",
            tags: agentData.tags || "",
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

  // Function to generate a random unique string
  function generateRandomUniqueString() {
    const timestamp = Date.now().toString(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1e6).toString(); // Random number
    return `${timestamp}-${randomNum}`;
  }

  const handleCreate = async () => {
    if (!validateFields()) return; // Check if fields are valid before proceeding

    setIsCreating(true); // Disable inputs when creating the agent
    setLoading(true); // Set loading state only after validation

    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create a provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer
      const signer = provider.getSigner();

      // Log the network details to verify the connection
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      // Ensure you're using Ethereum addresses directly
      const priceFeedAddress = "0x1D368773735ee1E678950B7A97bcA2CafB330CDc"; // Replace with actual Ethereum address
      const uniswapRouterAddress = "0x1D368773735ee1E678950B7A97bcA2CafB330CDc"; // Replace with actual Ethereum address

      // Create a contract instance
      const contract = new ethers.Contract(config.TOKEN_BONDING_CURVE_FACTORY_CONTRACT_ADDRESS, abi_token_bonding_curve_factory, signer);

      // Generate a random unique projectId
      const projectId = ethers.utils.formatBytes32String(generateRandomUniqueString());

      // Call the deployContract function with addresses
      const tx = await contract.deployContract(
        projectId, // Use projectId
        formData.agentName, // Use agent name as contract name
        tokenDetails.symbol, // Use token symbol
        parseInt(tokenDetails.supply), // Convert supply to number
        100, // basePriceUsd, replace with actual value
        10, // slopeUsd, replace with actual value
        1000000, // targetMarketCapUsd, replace with actual value
        priceFeedAddress, // Use Ethereum address
        uniswapRouterAddress // Use Ethereum address
      );

      console.log("Transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      const contractAddress = receipt.contractAddress; // Assuming the contract address is returned here
      console.log('Contract function executed, contract address:', contractAddress);

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
          categories: selectedFunction,
          tokenName: tokenDetails.name,
          tokenAddress: contractAddress, // deployed contract address
          totalSupply: tokenDetails.supply,
          tokenSymbol: tokenDetails.symbol,
          model: "gpt-4",
          projectId: projectId // Add projectId to the API request
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
      console.error('Error during agent creation:', error);
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
    <div className="min-h-screen bg-lightbg text-primary">
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
          <h1 className="text-4xl font-bold tracking-tight text-primary">Create New Agent</h1>
         
        </div>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Agent Details */}
          <div className="space-y-6">
            {/* <Card className="p-6  border border-primary/60 backdrop-blur">
              <h2 className="text-lg font-semibold text-primary mb-4">Upload your ABI</h2>
              <textarea
              className="flex w-full my-2 placeholder:text-primary bg-lightbg  border border-primary/60 rounded-lg px-4 py-2 text-primary focus:border-primary focus:outline-none overflow-y-auto scrollbar"
                placeholder="Enter your ABI here"
                value={formData.abi}
                onChange={(e) => handleChange("abi", e.target.value)}
                rows={6} // Set the number of visible rows
              />
              <Label className="mt-4 text-md text-primary">Smart Contract Address</Label>
              <Input
                placeholder="Ex. 0x1234abcd5678efgh9012ijkl3456mnop7890qrst"
                value={formData.contractAddress}
                onChange={(e) => handleChange("contractAddress", e.target.value)}
              />

            </Card> */}

            <Card className="p-6 border border-primary/60 backdrop-blur">
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
                className="block w-full rounded-md mt-2 text-primary bg-lightbg border border-primary/60  px-3 py-2 outline-none"
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
                className="block w-full rounded-md mt-2 bg-lightbg border border-primary/60 text-primary px-3 py-2 outline-none"
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
            </Card>

            <Card className="p-6 text-primary border border-primary/60 backdrop-blur">
              <h2 className=" text-xl mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Agent Functions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {agentFunctions.map((func, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`bg-lightbg border border-primary/60 text-primary hover:bg-primary/20 hover:text-primary  justify-start ${selectedFunction.includes(func.label) ? 'bg-primary/20' : ''}`}
                    onClick={() => handleFunctionSelect(func)}
                  >
                    <func.icon className="w-4 h-4 mr-2" />
                    {func.label}
                  </Button>
                ))}
              </div>
              {selectedFunction.length > 0 && (
                <p className="mt-4  text-lg">Selected Functions: {selectedFunction.join(', ')}</p>
              )}
            </Card>


            <Card className="p-6 border border-primary/60 backdrop-blur">
              <h2 className="text-lg font-semibold text-primary mb-4">Token Configuration</h2>
              <Label className="mt-4 text-md text-primary ">Token Name</Label>
              <Input
                placeholder="Token name"
                value={tokenDetails.name}
                onChange={(e) => handleChange("tokenName", e.target.value)}
                className="placeholder:text-primary"
              />

              <br />
              <Label className="mt-4 text-md text-primary">Ticker Symbol</Label>
              <Input
                placeholder="Token Symbol"
                value={tokenDetails.symbol}
                onChange={(e) => handleChange("tokensymbol", e.target.value)}
                className="placeholder:text-primary"
              />

              <br />
              <Label className="mt-4 text-md text-primary">Total Supply</Label>
              <Input
                type="number"
                placeholder="Total Supply"
                value={tokenDetails.supply}
                onChange={(e) => handleChange("tokenSupply", e.target.value)}
                className="placeholder:text-primary h-10"
              />

            </Card>
          </div>

          {/* Right Side - Agent Preview and Token Preview */}
          <div className="space-y-6">
            {/* Agent Preview */}
            <Card className="p-6 text-primary border border-primary/60 backdrop-blur">
              <h2 className="text-xl mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5" /> Agent Preview
              </h2>
              <div className=" p-4 rounded-lg border border-primary/60">
                <div className="flex items-start gap-4">
                  <Bot className="w-12 h-12 text-primary" />
                  <div>
                    <h3 className=" text-lg">{formData.agentName || "Agent Name"}</h3>
                    <p className="text-primary/80 text-sm">Codename: {formData.codename || "CODENAME"}</p>
                    <p className="text-primary/80 text-sm mt-2">{formData.roleDescription || "Agent role and description"}</p>
                    {selectedFunction.length > 0 && (
                      <p className="text-primary/80 text-sm mt-2">Functions: {selectedFunction.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Token Preview */}
            <Card className="p-6 text-primary border border-primary/60 backdrop-blur">
              <h2 className="text-xl mb-6 flex items-center gap-2">
                <Cloud className="w-5 h-5" /> Token Preview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg border border-primary/60">
                  <span className="text-primary">Token Name: {tokenDetails.name || "Token Name"}</span>
                  <span className="text-primary">Symbol: {tokenDetails.symbol || "SYMBOL"}</span>
                </div>
                <div>
                  <label className=" text-sm mb-2 block">Total Supply: {tokenDetails.supply || "0"}</label>
                  <Input
                    placeholder="Enter supply amount"
                    className=" border-primary/60 text-primary placeholder:text-primary/50"
                    value={tokenDetails.supply}
                    onChange={(e) => setTokenDetails({ ...tokenDetails, supply: e.target.value })}
                  />
                </div>
              </div>
            </Card>


        

            <div className="rounded-lg">
              {/* <p className="text-sm  text-center">
                Agent Cost: 500 S TOKEN
              </p> */}

              {agentId ? (
                <Button
                  className="w-full mt-4 border border-primary/60 text-primary hover:bg-primary/20 flex gap-1"
                  onClick={handleUpdate} // Function to handle the update action
                  disabled={loading} // Disable the button while loading
                >
                  {loading ? "Updating..." : "Update Agent"}
                </Button>
              ) : authenticated ? (
                <Button
                  className="w-full mt-4 border border-primary/60 text-primary hover:bg-primary/20 "
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Agent"}
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary mt-4 text-black flex gap-1"
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


