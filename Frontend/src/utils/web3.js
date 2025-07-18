// Web3 connection and wallet interaction utilities
import { BrowserProvider, parseEther, Contract } from 'ethers';

// Mock contract ABI (replace with your actual contract ABI)
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_taskId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      }
    ],
    "name": "createTask",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_taskId",
        "type": "string"
      }
    ],
    "name": "claimStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_taskId",
        "type": "string"
      }
    ],
    "name": "failTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_taskId",
        "type": "string"
      }
    ],
    "name": "getTaskDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Mock contract address (replace with your actual contract address)
const contractAddress = "0x123456789AbCdEf123456789AbCdEf123456789A";

// ✅ Wallet connection
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install MetaMask.");
    }

    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();  // ⬅️ await required

    const address = await signer.getAddress(); // ⬅️ await required

    const network = await provider.getNetwork();

    const contract = new Contract(contractAddress, contractABI, signer);

    return {
      address,
      provider,
      signer,
      contract,
      network: network.name
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// ✅ Create and stake task
export const createAndStakeTask = async (taskId, deadline, amountInEther) => {
  try {
    const { contract } = await connectWallet();

    const amount = parseEther(amountInEther.toString());

    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

    const tx = await contract.createTask(taskId, deadlineTimestamp, {
      value: amount
    });

    return await tx.wait();
  } catch (error) {
    console.error("Error creating and staking task:", error);
    throw error;
  }
};

// ✅ Claim stake
export const claimStake = async (taskId) => {
  try {
    const { contract } = await connectWallet();
    const tx = await contract.claimStake(taskId);
    return await tx.wait();
  } catch (error) {
    console.error("Error claiming stake:", error);
    throw error;
  }
};

// ✅ Get balance
export const getBalance = async (address) => {
  try {
    const { provider } = await connectWallet();
    const balance = await provider.getBalance(address);
    return (Number(balance) / 1e18).toFixed(4);  // Manual conversion
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

// ✅ Wallet listener
export const addWalletListener = (setAddress) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      setAddress(accounts[0] || '');
    });
  }
};