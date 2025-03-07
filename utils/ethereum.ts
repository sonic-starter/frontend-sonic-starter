import { ethers } from 'ethers';
import abi_erc20 from '@/config/abi_erc20.json';
import config from '@/config/config';
// import erc20 from '@/config/config';

export const getBalance = async (userAddress: string): Promise<string> => {
  try {
    // Create a provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(config.ERC20_CONTRACT_ADDRESS, abi_erc20, provider);

    // Call the balanceOf function
    const balance = await contract.balanceOf(userAddress);
    return ethers.utils.formatUnits(balance, 18); // Format the balance
  } catch (error) {
    console.error('Error fetching balance:', error);
    return "0";
  }
}; 


// const contract = new ethers.Contract(erc20.CONTRACT_ADDRESS, abi_erc20, provider);