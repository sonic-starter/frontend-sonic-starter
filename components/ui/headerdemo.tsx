"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { Modal } from "@/components/Modal";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import config from "@/config/config";
import { ethers } from 'ethers';
import abi_erc20 from '@/config/abi_erc20.json';
import { useAuth } from "@/contexts/AuthContext";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { authenticated, login, logout, user } = usePrivy();
 
  const [balance, setBalance] = useState<string>("0");

  const {signMessage} = usePrivy();
  const { setJwtToken , jwtToken } = useAuth();  // Get setJwtToken from context
  const userAddress = user?.wallet?.address;

  const truncatedAddress =
    userAddress && `${userAddress.slice(0, 5)}...${userAddress.slice(-5)}`;

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const navigateToCreatePage = () => {
    router.push("/create");
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleDisconnectClick = () => {
    setDisconnectModalOpen(true);
  };

 
  const confirmDisconnect = () => {
    handleLogout();  // Ensure JWT token is set to null and user is logged out
    setDisconnectModalOpen(false);
    setDropdownOpen(false);
    router.push("/");
  };
  


  const authenticateUser = async () => {
    // Check if JWT token already exists in context or localStorage
    const storedToken = localStorage.getItem("jwtToken");
    if (jwtToken || storedToken) {
      setJwtToken(storedToken);
      return;
    }
  
    if (!authenticated || !user?.wallet?.address) return;
  
    try {
      const nonceResponse = await axios.post(`${config.BASE_URL}/api/users/get-nonce`, {
        address: user.wallet.address,
      });
  
      if (nonceResponse.status !== 200 || !nonceResponse.data.nonce) {
        throw new Error("Failed to fetch nonce for authentication.");
      }
  
      const message = nonceResponse.data.nonce;
      let signature;
      console.log("User wallet object:", user.wallet);
      if ('embedded' in user.wallet) {
        signature = await signMessage(message);
      } else if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        signature = await signer.signMessage(message);
      } else {
        throw new Error("No wallet available to sign the message.");
      }
  
      console.log("signature in header...........", signature);
  
      const response = await axios.post(`${config.BASE_URL}/api/users/authenticate`, {
        address: user.wallet.address,
        signature: signature,
      });
  
      if (response.status === 200) {
        toast.success("Successfully authenticated!");
        setJwtToken(response.data.token);  // Store JWT token in context
        localStorage.setItem("jwtToken", response.data.token); // Persist token in localStorage
      } else {
        toast.error("Authentication failed.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("An error occurred during authentication.");
    }
  };
   
  useEffect(() => {
    if (authenticated && !jwtToken) {
      authenticateUser();
    }
  }, [authenticated]);
  
  const handleLogout = () => {
    logout();  // Call Privy's logout function
    setJwtToken(null);
    localStorage.removeItem("jwtToken");
    toast("Logged out successfully."); 
  };
  
  
  


  const cancelDisconnect = () => {
    setDisconnectModalOpen(false);
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  useEffect(() => {
    const registerUser = async () => {
      if (authenticated && userAddress) {
        try {
          await axios.post(`${config.BASE_URL}/api/users/register`, {
            address: userAddress,
          });
        } catch (error: any) {
          if (error.response?.status === 400) {
            const errorMessage = error.response?.data?.message || "Registration failed.";
            if (errorMessage !== "User already exists") {
              // toast.error(errorMessage);
              // console.log(errorMessage);
            }
          } else {
            // toast.error("Unexpected error occurred.");
          }
        }
      }
    };

    registerUser();
  }, [authenticated, userAddress]);

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
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [authenticated, userAddress]);

  return (
    <div >
      <Toaster position="top-right" reverseOrder={false} />

      <header className="flex items-center justify-between mx-auto py-6 max-w-8xl">
        <div className="flex items-center gap-4">
          {pathname === "/" ? (
            <Link href="/" className="cursor-pointer">
              <Image src="/images/logo.svg" alt="Gintonic" width={107} height={35} />
            </Link>
          ) : (
            <button onClick={handleBackClick} className="text-foreground hover:text-foreground">
              <div className="flex items-center gap-4">
                <ArrowLeft className="h-5 w-5" />
                <h1 className="text-2xl font-bold">Back</h1>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Balance and Create Agent button */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={toggleModal}>
            <div className="p-1 rounded-full bg-primary">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-white">{formatBalance(balance)} GIN</span>
          </div>

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={navigateToCreatePage}
          >
            <span className="hidden md:inline">Build Your Agent</span>
            <span className="md:hidden">Build Agent</span>
          </Button>

          {/* Dropdown and My Account */}
          {authenticated ? (
            <div className="relative">
              {/* Toggle Dropdown */}
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-2 items-center"
                onClick={toggleDropdown} // Handle the toggle functionality
              >
                <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
                <span className="hidden md:inline">{truncatedAddress}</span>
                {dropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute z-10 right-0 bg-[#1F1F1F] shadow-lg rounded-md py-2 w-40">
                  <div
                    className="px-4 py-2 text-sm text-white hover:bg-[#242424] cursor-pointer"
                    onClick={() => router.push("/myagents")}
                  >
                    My Agents
                  </div>
                  <div
                    className="px-4 py-2 text-sm text-white hover:bg-[#242424] cursor-pointer"
                    onClick={handleDisconnectClick}
                  >
                    Disconnect
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
              onClick={login}
            >
              <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
              <span className="hidden md:inline">Connect</span>
            </Button>
          )}
        </div>
      </header>

      <Modal isOpen={isModalOpen} onClose={toggleModal} />

      {disconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1F1F1F] rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Disconnect Wallet</h2>
            <p className="text-sm mb-1">Are you sure you want to disconnect your wallet?</p>
            <p className="text-xs mb-6 text-muted-foreground">on disconnect, redirect to home page</p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-primary text-primary-foreground rounded-md"
                onClick={confirmDisconnect}
              >
                Disconnect
              </Button>
              <button
                className="bg-[#242424] text-white border-[#414141] rounded-md px-4 py-2"
                onClick={cancelDisconnect}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


