"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Header } from "../ui/header";
import axios from "axios";
import config from "@/config/config";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, RotateCcw, Send, LineChart, Circle, User2Icon, Rocket, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ethers } from 'ethers';
import abi_erc20 from '@/config/abi_erc20.json';
import Modal from "../Modal";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "../ui/input";





// Add a CSS class for gray text
const grayTextClass = "text-gray-500";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  userAddress: string;
  // status: "Active" | "Inactive";
  imageUrl: string;
  llmModel: string;
  categories: string[];
  tokenName: string,
  tokenAddress: string,
  totalSupply: number,
  tokenSymbol: string,

}


export default function AgentDetail() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<string>("aiAgentChat");
  const [activeTradeTab, setActiveTradeTab] = useState<"buy" | "sell">("buy");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("Generating response");
  const [balance, setBalance] = useState<string>("0");


  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const [isShowWalletModal, setIsShowWalletModal] = useState<boolean>(false); // State for showing wallet modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const { jwtToken } = useAuth();

  const router = useRouter();
  const infoRef = useRef(null);
  const chatRef = useRef(null);
  // const [infoHeight, setInfoHeight] = useState("auto");
  // const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // useEffect(() => {
  //   const updateScreenWidth = () => setScreenWidth(window.innerWidth);
  //   window.addEventListener("resize", updateScreenWidth);
  //   return () => window.removeEventListener("resize", updateScreenWidth);
  // }, []);

  // useEffect(() => {
  //   if (infoRef.current) {
  //     const observer = new ResizeObserver((entries) => {
  //       for (let entry of entries) {
  //         setInfoHeight(`${entry.contentRect.height}px`);
  //       }
  //     });
  //     observer.observe(infoRef.current);
  //     return () => observer.disconnect();
  //   }
  // }, [infoRef.current]);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleCopy = (text: string, index: number): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000); // Reset icon after 2 seconds
    });
  };

  const { authenticated, login, user } = usePrivy();

  const userAddress = user?.wallet?.address;

  // Balance formatting function
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toFixed(2);
  };

  // Memoized formatted balance
  const formattedBalance = useMemo(() => formatBalance(balance), [balance]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !userAddress) return;

      try {
        // Create a provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(config.ERC20_CONTRACT_ADDRESS, abi_erc20, provider);

        // Call the balanceOf function
        const balance = await contract.balanceOf(userAddress);
        setBalance(ethers.utils.formatUnits(balance, 18)); // Format the balance
        console.log("balance...............", balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [authenticated, userAddress]);

  useEffect(() => {
    const fetchThreadAndConversation = async () => {
      console.log(id, jwtToken, authenticated, balance);
      if (!id || !authenticated || parseFloat(balance) < 5) return; // Ensure id, jwtToken, authenticated, and sufficient balance are available before proceeding

      try {
        // Fetch agent details to get the ThreadId first
        const threadResponse = await axios.get(
          `${config.BASE_URL}/api/assistants/${id}/threadId`
        );

        const threadId = threadResponse.data.data.threadId;
        console.log("Thread ID for fetch conversation .............", threadId);
        console.log("jwtToken for fetch conversation .............", jwtToken);

        if (!threadId) {
          console.error("Thread ID not found");
          return;
        }

        // Now fetch the conversation using the retrieved threadId
        const responseConversation = await axios.get(
          `${config.BASE_URL}/api/conversations/${threadId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        console.log("Response of previous conversation..............:", responseConversation.data);

        // Check if previous conversation exists and set messages
        if (responseConversation.data && responseConversation.data.length > 0) {
          const fetchedMessages = responseConversation.data.map((msg: any) => ({
            sender: msg.role === "user" ? "user" : "ai",
            text: msg.content,
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          }));
          setMessages(fetchedMessages); // Set the fetched messages to state
        }
      } catch (error) {
        console.error("Failed to fetch conversation:", error);
      }
    };

    fetchThreadAndConversation();
  }, [id, jwtToken, authenticated, balance]);




  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return; // Only fetch if id is available

      try {
        // Fetch agent details
        const agentResponse = await axios.get(`${config.BASE_URL}/api/assistants/${id}`);
        if (agentResponse.data.success) {
          console.log("Agent detail:", agentResponse.data.data);
          setAgentDetails(agentResponse.data.data);
        } else {
          console.log("Error fetching agent details:", agentResponse.data.message);
        }
      } catch (error) {
        console.log("Failed to fetch details:", error);
      }
    };

    fetchAgentDetails();
  }, [id]); // Dependency ensures fetch is triggered when id changes

  useEffect(() => {
    if (authenticated) {
      setIsShowWalletModal(false);
    }
  }, [authenticated]);


  useEffect(() => {
    // Scroll to the bottom of the chatbox every time messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingText((prev) => {
          if (prev === "Generating response...") return "Generating response";
          return prev + ".";
        });
      }, 500);
    } else {
      setLoadingText("Generating response");
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Ensure the loader is visible and properly styled
  const loader = (
    // <span className="loader ml-1 inline-block"></span
    <div className="w-4 h-4 border-t-2 border-b-2 border-primary ml-2 border-solid rounded-full animate-spin"></div>
  );



  if (!agentDetails) {
    return (
      <div className="absolute inset-0 flex justify-center items-center bg-lightbg  z-50 mt-24">
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }



  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSendMessage = async (messageText: string) => {
    if (messageText.trim() === "") return;

    // Append the user's message to the message list
    const newMessages: Message[] = [
      ...messages,
      { sender: "user", text: messageText, timestamp: new Date().toLocaleTimeString() },
    ];
    setMessages(newMessages);
    setInputMessage("");

    const ginBalance = parseFloat(formatBalance(balance));
    if (ginBalance < 5) {
      // Show insufficient balance message
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: "Insufficient GIN balance. You need at least 5 GIN tokens to chat.", timestamp: new Date().toLocaleTimeString() },
      ]);
      return; // Exit the function if balance is insufficient
    }

    setLoading(true);

    // Add a loading message to indicate waiting for AI response
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "ai", text: `${loadingText}`, timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      // Fetch threadId first, no need to check if it's already available
      const threadResponse = await axios.get(
        `${config.BASE_URL}/api/assistants/${id}/threadId`
      );

      console.log("Thread ID response from agent detail:", threadResponse.data.data.threadId);

      // Get the threadId from the response and use it to send the message
      const fetchedThreadId = threadResponse.data.data.threadId;
      if (!fetchedThreadId) {
        console.log("No thread ID returned from the API.");
        return;
      }


      // Call the message API with the fetched threadId
      const response = await axios.post(
        `${config.BASE_URL}/api/threads/${fetchedThreadId}/messages`,
        { message: messageText },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Message response:", response.data);

      // Extract the AI's response from the API response
      const aiResponseText =
        response.data.data.content[0]?.text?.value || "No reply from AI.";

      // Replace the "generating response..." message with the AI's actual response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the last loading message
        { sender: "ai", text: aiResponseText, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      console.log("Failed to send message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the last loading message
        { sender: "ai", text: "Failed to fetch a response from AI.", timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && authenticated) {
      handleSendMessage(inputMessage);
    }
  };


  const toggleWalletModal = () => {
    setIsShowWalletModal(!isShowWalletModal);
  };



  const handleInputClick = () => {
    // If not authenticated, open the wallet modal

    const formattedBalance = parseFloat(formatBalance(balance));

    if (!authenticated) {
      toggleWalletModal();
    }

    // If authenticated but balance is 0, open the GIN token modal
    // else if (parseFloat(balance) <= 0) {
    //   toggleGinTokenModal();
    // }
  };

  const handleRegenerateResponse = async (index: number) => {
    // Ensure we only regenerate if the previous message is from AI
    if (messages[index].sender !== "ai") return;

    const userMessage = messages[index - 1]; // Assuming the user message is right before the AI response

    if (!userMessage) return; // No user message to regenerate from

    // Remove the previous AI response and show loading message
    setMessages((prevMessages) => [
      ...prevMessages.slice(0, index), // Keep messages before the AI response
      { sender: "ai", text: "Regenerating response...", timestamp: new Date().toLocaleTimeString() }, // New loading message
      ...prevMessages.slice(index + 1), // Keep messages after the AI response
    ]);

    try {
      // Fetch threadId first, no need to check if it's already available
      const threadResponse = await axios.get(
        `${config.BASE_URL}/api/assistants/${id}/threadId`
      );

      const fetchedThreadId = threadResponse.data.data.threadId;
      if (!fetchedThreadId) {
        console.log("No thread ID returned from the API.");
        return;
      }

      // Call the message API with the fetched threadId
      const response = await axios.post(
        `${config.BASE_URL}/api/threads/${fetchedThreadId}/messages`,
        { message: userMessage.text }, // Use the original user message
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Extract the AI's response from the API response
      const aiResponseText =
        response.data.data.content[0]?.text?.value || "No reply from AI.";

      // Replace the loading message with the new AI response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, index), // Remove the loading message
        { sender: "ai", text: aiResponseText, timestamp: new Date().toLocaleTimeString() }, // New AI response
        ...prevMessages.slice(index + 1), // Keep messages after the AI response
      ]);
    } catch (error) {
      console.log("Failed to regenerate message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, index), // Remove the loading message
        { sender: "ai", text: "Failed to fetch a response from AI.", timestamp: new Date().toLocaleTimeString() },
        ...prevMessages.slice(index + 1), // Keep messages after the AI response
      ]);
    }
  };


  const handleBackClick = () => {
    router.back();
  };



  return (
    <div className="min-h-screen bg-lightbg text-primary">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Header />
        <button onClick={handleBackClick} className="text-primary ">
          <div className="flex items-center gap-4">
            <ArrowLeft className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Back</h1>
          </div>
        </button>

        <div className="grid grid-cols-11 gap-4">

          <div className="col-span-8">
            <div
              ref={infoRef}
              className="md:col-span-3 space-y-6 rounded-md"
            >
              {/* Agent Detail */}
              <div className=" border flex justify-between border-primary/60 text-primary p-5 mt-6 rounded-lg">
                {/* Agent Image */}
                <div className="flex gap-2 items-center">
                  <Image
                    src={agentDetails.imageUrl || "/images/agent_6.svg"}
                    alt={agentDetails.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-md"
                  />
                  <div className="flex flex-col gap-2 text-primary">
                    <p className="text-sm  ">Codename: {agentDetails.codeName}</p>
                    <h2 className="text-2xl font-bold ">{agentDetails.name}</h2>
                    <p className="text-md ">{agentDetails.instructions}</p>

                    <div className="flex gap-4 mt-3">
                      <button className=" border border-primary/60 hover:bg-primary/10 hover:text-primary  px-4 py-2 rounded-md flex items-center gap-2">
                        {/* <UserCheck /> Follow */}
                        Buy
                      </button>
                      <button className="border border-primary/60 hover:bg-primary/10 hover:text-primary  px-4 py-2 rounded-md flex items-center gap-2">
                        Sell
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col content-center gap-2 ">
                  <button className="bg-primary/10  rounded-md px-4 py-2 flex items-center gap-2">
                    <LineChart /> $0M Market Cap
                  </button>
                  <button className="bg-primary/10  rounded-md px-4 py-2  flex items-center gap-2">
                    📊 View Chart
                  </button>
                  <button className="bg-primary/10  rounded-md px-4 py-2  flex items-center gap-2">
                    <Circle className="text-red-500" /> Token Live: NO
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className=" md:block mb-4 py-6 ">
              <div className="flex gap-8 border-b border-primary/60">
                <button
                  className={`py-2 ${activeTab === "aiAgentChat" ? "text-primary border-b-2 border-primary" : "text-primary"}`}
                  onClick={() => handleTabChange("aiAgentChat")}
                >
                  AI Agent Chat
                </button>
                <button
                  className={`py-2 ${activeTab === "information" ? "text-primary border-b-2 border-primary" : "text-primary"}`}
                  onClick={() => handleTabChange("information")}
                >
                  Information
                </button>
                <button
                  className={`py-2 ${activeTab === "trade" ? "text-primary border-b-2 border-primary" : "text-primary"}`}
                  onClick={() => handleTabChange("trade")}
                >
                  Trade
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full pb-6 ">
              {/* Chat Section */}
              {activeTab === "aiAgentChat" && (
                <div
                  ref={chatRef}
                  className="md:col-span-8 h-full "
                >
                  <div
                    className="rounded-lg border border-primary/60 text-primary  flex flex-col relative h-full"
                  >

                    {/* Chat Header */}
                    <div className="flex justify-between mb-1 text-primary border-b border-primary/60 p-3">
                      <div className="flex place-items-start gap-2">
                        <Image
                          src={agentDetails.imageUrl || "/images/agent_6.svg"}
                          alt="union"
                          width={24}
                          height={24}
                          className=" mt-1"
                        />
                        <div className="flex flex-col">
                          <h3 className="text-lg ">
                            {agentDetails.name}
                          </h3>
                          <p className="text-sm ">
                            by {agentDetails.userAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center place-items-start text-primary text-sm">
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                        Active
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                      className="flex-grow overflow-y-auto py-14"
                      ref={chatBoxRef}
                      style={{ height: "500px" }}
                    >
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.sender === "user" ? (
                            <div className="flex items-start gap-2 mr-2">
                              <div className="rounded-lg p-2 px-3 max-w-xs bg-primary/10 text-primary">
                                {message.text}
                                <div className="text-xs text-primary mt-1 text-right">
                                  {message.timestamp}
                                </div>
                              </div>
                              <div className="px-2 py-2 rounded-full  border border-primary">
                                {/* <Image
                    src="/images/user.svg"
                    alt="User Icon"
                    width={10}
                    height={18}
                    className="rounded-full"
                  /> */}
                                <User2Icon className="h-4 w-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1 ml-2">
                              <div className="px-1 pb-4 rounded-full">
                                <Image
                                  src={agentDetails.imageUrl || "/images/agent_6.svg"}
                                  alt="AI Logo"
                                  width={22}
                                  height={22}
                                  className="text-primary-foreground"
                                />
                              </div>
                              <div className="rounded-lg pb-4 max-w-xs text-primary">
                                {message.sender === "ai" && (
                                  <>
                                    <div className="flex items-center">
                                      {message.text ===
                                        "Insufficient GIN balance. You need at least 5 GIN tokens to chat." ? (
                                        <div>
                                          <span
                                            className="text-primary underline underline-dashed cursor-pointer"
                                            onClick={toggleModal}
                                          >
                                            Insufficient GIN balance
                                          </span>
                                          . You need at least 5 GIN tokens to chat.
                                        </div>
                                      ) : (
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          rehypePlugins={[rehypeRaw]}
                                          className={`text-primary prose prose-invert ${loading && index === messages.length - 1 ? grayTextClass : ""}`}
                                        >
                                          {message.text}
                                        </ReactMarkdown>
                                      )}
                                      {loading && index === messages.length - 1 && loader}
                                    </div>
                                    {/* Only hide the icons and timestamp for the currently loading message */}
                                    {!loading || index !== messages.length - 1 ? (
                                      <div className="flex gap-2 mt-2 text-primary">
                                        {copiedMessageIndex === index ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy
                                            className="h-4 w-4 cursor-pointer"
                                            onClick={() => handleCopy(message.text, index)}
                                          />
                                        )}
                                        {message.text !== "Insufficient GIN balance. You need at least 5 GIN tokens to chat." && (
                                          <RotateCcw
                                            className="h-4 w-4 cursor-pointer"
                                            onClick={() => handleRegenerateResponse(index)}
                                          />
                                        )}
                                        <p className="text-xs text-primary">
                                          {message.timestamp}
                                        </p>
                                      </div>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="absolute rounded-lg bg-lightbg bottom-0 left-0 w-full flex items-center gap-2 p-2 text-primary  border-t border-primary/60 mt-8">
                      <input
                        type="text"
                        placeholder={
                          !authenticated
                            ? "Connect your wallet first..."
                            : `Message ${agentDetails.name}...`
                        }
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={!loading ? handleKeyPress : undefined}
                        disabled={!authenticated || loading}
                        className={`flex-grow py-2 px-4 placeholder:text-primary border border-primary/60 bg-lightbg rounded-lg text-primary focus:border-primary focus:outline-none ${!authenticated ? "opacity-60 " : ""}`}
                      />
                      <button
                        onClick={() => handleSendMessage(inputMessage)}
                        className={`px-3 py-2 border border-primary/60 rounded-md ${!authenticated || loading ? "opacity-60 cursor-not-allowed" : "text-primary"}`}
                        disabled={!authenticated || loading}
                      >
                        <Send />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Information Section */}
              {activeTab === "information" && (
                <div className="flex flex-col gap-4 h-full text-primary">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-lightbg backdrop-blur-sm p-6 rounded-lg border border-primary/60">
                      <h3 className="text-xl font-bold text-primary mb-4 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bot w-5 h-5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                        <span>Basic Information</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-primary/80 mb-1">Name</div>
                          <div >Zara</div>
                        </div>
                        <div>
                          <div className="text-sm text-primary/80 mb-1">Codename</div>
                          <div >CYBER-SHIELD</div>
                        </div>
                        <div>
                          <div className="text-sm text-primary/80 mb-1">Character</div>
                          <div >Blade Runner</div>
                        </div>
                        <div>
                          <div className="text-sm text-primary/80 mb-1">Role</div>
                          <div >Security Chief</div>
                        </div>
                      </div>
                    </div>

                    <div className=" backdrop-blur-sm p-6 rounded-lg border border-primary/60">
                      <h3 className="text-xl font-bold text-primary mb-4 flex items-center space-x-2">

                        <span>Personality Traits</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-4"><div className="p-4  rounded-lg border border-primary/60">
                        <div className="flex items-center space-x-2 mb-2">

                          <span className="text-sm ">Intelligence</span>
                        </div><div className="text-xl font-bold text-primary">98%</div>
                      </div><div className="p-4  rounded-lg border border-primary/60">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm ">Accuracy</span>
                          </div>
                          <div className="text-xl font-bold text-primary">95%</div>
                        </div>
                        <div className="p-4  rounded-lg border border-primary/60">
                          <div className="flex items-center space-x-2 mb-2">

                            <span className="text-sm ">Security</span>
                          </div>
                          <div className="text-xl font-bold text-primary">97%</div>
                        </div>
                        <div className="p-4  rounded-lg border border-primary/60">
                          <div className="flex items-center space-x-2 mb-2">

                            <span className="text-sm ">Processing</span>
                          </div>
                          <div className="text-xl font-bold text-primary">96%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className=" backdrop-blur-sm p-6 rounded-lg border border-primary/60">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-code w-5 h-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      <span>Description &amp; Capabilities</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-primary/80 mb-2">Description</div>
                        <p>Cybersecurity and network defense specialist</p>
                      </div>
                      <div>
                        <div className="text-sm text-primary/80 mb-2">Specialization</div>
                        <p>Security</p>
                      </div>
                      <div>
                        <div className="text-sm text-primary/80 mb-2">Functions</div>
                        <ul className="list-disc list-inside  space-y-1">
                          <li>Advanced neural processing</li>
                          <li>Real-time data analysis</li>
                          <li>Adaptive learning systems</li>
                          <li>Multi-dimensional problem solving</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Section */}
              {activeTab === "trade" && (
                <div className="md:col-span-8 h-full p-4 border border-primary/60 text-primary rounded-lg">
                  <h2 className="text-2xl font-bold text-left">Token Trading</h2>
                  <div className="flex justify-center flex-col gap-3">


                    <div className="flex justify-center mt-4 p-4 bg-primary/10 rounded-full w-fit mx-auto">
                      <Rocket className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-center mt-2 font-bold">Trading Coming Soon</h2>
                    <p className="text-center max-w-md mx-auto">Token trading functionality will be available soon on Raydium DEX. Stay tuned for updates!</p>
                    <div className="w-full max-w-md p-4 bg-primary/10 rounded-lg border border-primary/60 mx-auto">
                      <div className="flex items-start space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-info w-4 h-4 text-primary flex-shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
                        </svg>
                        <div className="text-sm">
                          <p className="font-medium mb-1">Trading Features:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Raydium DEX integration</li>
                            <li>Automated market making</li>
                            <li>Deep liquidity pools</li>
                            <li>Low trading fees</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3 my-6">


            <div className=" p-4 my-auto border border-primary/60 rounded-lg bg-lightbg mb-4">
              <div className="flex justify-evenly mb-4">
                <button
                  className={`text-primary ${activeTradeTab === "buy" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTradeTab("buy")}
                >
                  Buy
                </button>
                <button
                  className={`text-primary ${activeTradeTab === "sell" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTradeTab("sell")}
                >
                  Sell
                </button>
              </div>

              {activeTradeTab === "buy" ? (
                <>
                  <h2 className="text-2xl font-bold text-primary">Buy Tokens</h2>
                  <p className="text-lg text-primary">$0.53 <span className="text-green-500">+2.18%</span></p>
                  {/* Graph Placeholder */}
                  <div className="h-32 bg-lightbg/20 border border-primary/60 rounded-md mb-4">
                    <p className="text-center text-primary">Graph Placeholder</p>
                  </div>
                  {/* Input and other elements for buying tokens */}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary">Sell Tokens</h2>
                  <p className="text-lg text-primary">$0.53 <span className="text-red-500">-2.18%</span></p>
                  {/* Graph Placeholder */}
                  <div className="h-32 bg-lightbg/20 border border-primary/60 rounded-md mb-4">
                    <p className="text-center text-primary">Graph Placeholder</p>
                  </div>
                  {/* Input and other elements for selling tokens */}
                </>
              )}

              {/* Common elements for both Buy and Sell */}
              <div className="flex items-center mb-4">
                <Input
                  type="number"
                  className="border border-primary/60 rounded-md p-2 flex-grow"
                />
                <select className="border bg-lightbg border-primary/60 rounded-md p-2 ml-2 outline-none">
                  <option>USD</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <button className="bg-primary text-white rounded-md px-4 py-2">500</button>
                <button className="bg-primary text-white rounded-md px-4 py-2">500</button>
                <button className="bg-primary text-white rounded-md px-4 py-2">500</button>
              </div>

              <p className="text-sm text-gray-500">Available Balance: $0.00</p>

              {/* New Card UI */}

            </div>
            <div className="p-4 bg-lightbg text-primary rounded-lg border border-primary/60 w-full max-w-md">
              {/* Token Price */}
              <h2 className="text-2xl font-bold">$0.020955</h2>

              {/* Market Stats */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-lg border border-primary/60">
                  <span className="text-sm text-primary">Market Cap</span>
                  <div className="text-lg font-bold">$21.02m</div>
                </div>
                <div className="p-3 rounded-lg border border-primary/60">
                  <span className="text-sm text-primary">Liquidity</span>
                  <div className="text-lg font-bold">$4.23m</div>
                </div>
                <div className="p-3 rounded-lg border border-primary/60">
                  <span className="text-sm text-primary">Holders</span>
                  <div className="text-lg font-bold">266,647</div>
                </div>
                <div className="p-3 rounded-lg border border-primary/60">
                  <span className="text-sm text-primary">24h Volume</span>
                  <div className="text-lg font-bold">$165.51k</div>
                </div>
                <div className="p-3 rounded-lg border border-primary/60 col-span-2">
                  <span className="text-sm text-primary">Top 10</span>
                  <div className="text-md font-bold">40.14%</div>
                </div>
              </div>

              {/* Price Changes */}


              {/* Volume */}
              <div className="mt-2">
                <span className="text-sm text-primary">Volume</span>
                <div className="text-lg font-bold">$165.51k</div>
              </div>

              {/* Transactions */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-sm text-primary">Txns</span>
                  <div className="text-lg font-bold">545</div>
                </div>
                <div>
                  <span className="text-sm text-primary">Makers</span>
                  <div className="text-lg font-bold">345</div>
                </div>
              </div>

              {/* Buy/Sell Bars */}

              {/* <div className="mt-4">
        <div className="flex justify-between text-sm text-primary">
          <span>Buyers: 152</span>
          <span>Sellers: 193</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-1 relative">
          <div className="absolute left-0 h-2 bg-green-500 rounded-full" style={{ width: "44%" }}></div>
          <div className="absolute right-0 h-2 bg-red-500 rounded-full" style={{ width: "56%" }}></div>
        </div>
      </div> */}
            </div>
          </div>
        </div>


      </div>



      <Modal isOpen={isModalOpen} onClose={toggleModal} />

      {isShowWalletModal && (
        <div className="fixed inset-0 z-50 flex flex-col gap-2 items-center justify-center">
          <div className="bg-[#242424] text-foreground rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Sign in to continue</h2>
              <button onClick={() => setIsShowWalletModal(false)} className="text-foreground">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Please sign in to send messages and save your conversation.
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
              onClick={login}
            >
              <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
              Connect Wallets
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}























