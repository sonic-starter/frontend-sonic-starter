import React, { createContext, useState, ReactNode } from 'react';

// Define the types for the context values
interface FunctionMapping {
  [key: string]: {
    title: string;
    parameters: string;
  };
}

interface FunctionContextType {
  functionMappings: FunctionMapping;
  setFunctionMappings: React.Dispatch<React.SetStateAction<FunctionMapping>>;
}

// Create the context with default values (optional)
export const FunctionContext = createContext<FunctionContextType | undefined>(undefined);

// Define the provider's props
interface FunctionProviderProps {
  children: ReactNode;
}

// Create a provider component
export const FunctionProvider: React.FC<FunctionProviderProps> = ({ children }) => {
  const [functionMappings, setFunctionMappings] = useState<FunctionMapping>({});

  return (
    <FunctionContext.Provider
      value={{
        functionMappings,
        setFunctionMappings,
      }}
    >
      {children}
    </FunctionContext.Provider>
  );
};





// import React, { createContext, useState, ReactNode } from 'react';

// // Define the types for the context values
// interface FunctionContextType {
//   walletAddress: string;
//   setWalletAddress: (address: string) => void;
// }

// // Create the context
// export const FunctionContext = createContext<FunctionContextType | undefined>(undefined);

// // Define the provider's props
// interface WalletProviderProps {
//   children: ReactNode;
// }

// // Create a provider component
// export const FunctionProvider: React.FC<FunctionProviderProps> = ({ children }) => {
//   const [functionName, setFunctionName] = useState<string>('');

//   return (
//     <FunctionContext.Provider value={{ functionName, setFunctionName}}>
//       {children}
//     </WalletContext.Provider>
//   );
// };
