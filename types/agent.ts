// Define the Agent type
export interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  isActive: boolean;
  imageUrl: string;
  categories: string[] ;
  tokenName: string,
  tokenAddress: string,
  totalSupply: number,
  tokenSymbol: string,
  
  // Add other fields as necessary
} 