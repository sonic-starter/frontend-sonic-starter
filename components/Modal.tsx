"use client";

import { FC, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { X , Copy , Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import erc20Abi from '@/config/abi_erc20.json';
import gintonicAbi from '@/config/gintonic.json';
import toast from 'react-hot-toast';
import config from '@/config/config';

const GINTONIC_CONTRACT_ADDRESS = config.GINTONIC_CONTRACT_ADDRESS;
const ERC20_CONTRACT_ADDRESS = config.ERC20_CONTRACT_ADDRESS;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { authenticated, login, logout, user } = usePrivy();
  const userAddress = user?.wallet?.address;
  const truncatedAddress =
  userAddress && `${userAddress.slice(0, 7)}...${userAddress.slice(-7)}`;
  const router = useRouter();

  const [balance, setBalance] = useState<string>("0");
  const [ginAmount, setGinAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAddressClick = () => {
    if (authenticated && userAddress) {
      navigator.clipboard.writeText(userAddress).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1000); // Reset after 2 seconds
      });
    }
  };

  const fetchBalance = async () => {
    if (!authenticated || !userAddress) {
      console.log('User not authenticated or user address not available');
      return;
    }

    try {
      console.log('Fetching balance for address:', userAddress);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20Contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, erc20Abi, provider);
      const balance = await erc20Contract.balanceOf(userAddress);
      console.log('Raw balance:', balance.toString());
      setBalance(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const exchangeContract = new ethers.Contract(GINTONIC_CONTRACT_ADDRESS, gintonicAbi, provider);
      const rate = await exchangeContract.exchangeRate();
      setExchangeRate(rate.toNumber());
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchExchangeRate();
  }, [authenticated, userAddress]);

  const handleExchange = async () => {
    if (!authenticated || !ginAmount) {
      console.log('User not authenticated or no S TOKEN entered');
      return;
    }

    setLoading(true);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const exchangeContract = new ethers.Contract(GINTONIC_CONTRACT_ADDRESS, gintonicAbi, signer);

      const ginAmountBN = ethers.utils.parseUnits(ginAmount, 18);
      const ethValue = ginAmountBN.div(exchangeRate);

      console.log('ETH Value:', ethValue.toString());
      console.log('Exchange Rate:', exchangeRate);
      console.log('S TOKEN Amount:', ginAmount);

      const tx = await exchangeContract.exchange({ value: ethValue });
      console.log('Transaction sent, waiting for confirmation...');
      await tx.wait();

      console.log('Exchange successful');
      toast.success('Exchange successful!');

      // Fetch updated balance
      fetchBalance();

      // Clear the input box and close the modal
      setGinAmount("");
      onClose();
    } catch (error) {
      console.error('Error during exchange:', error);
      toast.error('Exchange failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate ETH value based on S TOKEN amount and exchange rate
  const calculateEthValue = (): string => {
    if (!ginAmount || exchangeRate === 0) return "0";
    const ginAmountBN = ethers.utils.parseUnits(ginAmount, 18);
    const ethValue = ginAmountBN.div(exchangeRate);
    const formattedEthValue = ethers.utils.formatEther(ethValue);
    console.log('S TOKEN Amount:', ginAmount);
    console.log('Exchange Rate:', exchangeRate);
    console.log('Calculated ETH Value:', formattedEthValue);
    return formattedEthValue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-2 items-center justify-center bg-gradient-to-br from-darkStart to-darkEnd/50">
      <div className="bg-gradient-to-br from-darkStart to-darkEnd border border-borderColor/60 text-primary  rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">Get S Tokens</h2>
          <button onClick={onClose} className="text-foreground">
            <X className="h-5 w-5 text-primary" />
          </button>
        </div>
        <p className="text-sm text-primary mb-6">
          Purchase tokens to unlock AI agent interactions
        </p>
        <Button
      className="w-full border border-borderColor/60 text-primary  rounded-md flex gap-1"
      onClick={login}
    >
      <Wallet className="text-primary"/>
      {authenticated ? (
        <span className="flex items-center gap-1">
          <span
            onClick={handleAddressClick}
            title={copySuccess ? "Copied!" : "Click to copy address"}
            className="cursor-pointer underline"
          >
            {truncatedAddress}
          </span>
          <span
            onClick={handleAddressClick}
            title={copySuccess ? "Copied!" : "Copy address"}
            className="cursor-pointer"
          >
            {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </span>
        </span>
      ) : (
            "Connect "
          )}
        </Button>
      </div>

      <div className="bg-gradient-to-br from-darkStart to-darkEnd border text-primary border-borderColor/60  rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">
        <div>
          <h3 className="text-2xl font-semibold mb-4">Add S token</h3>
          <p className="text-sm ">
            Your S TOKEN Balance: {balance} S TOKEN
          </p>
          <p className="text-sm  mb-8">
            Exchange Rate: 1 ETH = {exchangeRate} S TOKEN
          </p>
          <div className="flex gap-2 mb-4">
            <button
              className="w-1/3  border border-borderColor/60  hover:bg-primary/10  p-2 rounded-md text-center"
              onClick={() => setGinAmount("500000")}
            >
              500K
            </button>
            <button
              className="w-1/3  border border-borderColor/60  hover:bg-primary/10  p-2 rounded-md text-center"
              onClick={() => setGinAmount("1000000")}
            >
              1M
            </button>
            <button
              className="w-1/3  border border-borderColor/60  hover:bg-primary/10  p-2 rounded-md text-center"
              onClick={() => setGinAmount("2000000")}
            >
              2M
            </button>
          </div>
          <label className="">S TOKEN Amount</label>
          <input
            type="number"
            value={ginAmount}
            onChange={(e) => setGinAmount(e.target.value)}
            placeholder="S TOKEN amount"
            className="w-full px-4 py-3 bg-gradient-to-br from-darkStart to-darkEnd rounded-md placeholder:text-primary border border-borderColor/60 my-3 focus:outline-none"
            disabled={!authenticated}
          />
          <p className="text-sm">
            You will be charged {calculateEthValue()} ETH
          </p>
          
          <div className="flex gap-2 mt-4">
            <Button
              className={`w-full bg-gradient-to-br from-darkStart to-darkEnd  border border-borderColor/60  hover:bg-primary/10 rounded-md ${
                !authenticated || !ginAmount || loading ? "opacity-50 cursor-not-allowed text-primary" : "text-primary"
              }`}
              onClick={handleExchange}
              disabled={!authenticated || !ginAmount || loading}
            >
              {loading ? "Processing..." : "Add tokens"}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-gradient-to-br from-darkStart to-darkEnd hover:text-primary  border border-borderColor/60  hover:bg-primary/10  rounded-md"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;