// Web3 connection and wallet interaction utilities
import { ethers } from 'ethers';

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

// Function to connect wallet
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install Metamask or another provider.");
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = accounts[0];
    
    // Get network information
    const network = await provider.getNetwork();
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
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

// Function to create and stake a task
export const createAndStakeTask = async (taskId, deadline, amountInEther) => {
  try {
    const { contract } = await connectWallet();
    
    // Convert amount to wei
    const amount = ethers.utils.parseEther(amountInEther.toString());
    
    // Convert deadline to timestamp (if not already)
    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
    
    // Create task and stake amount
    const tx = await contract.createTask(taskId, deadlineTimestamp, {
      value: amount
    });
    
    return await tx.wait();
  } catch (error) {
    console.error("Error creating and staking task:", error);
    throw error;
  }
};

// Function to claim stake
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

// Function to get eth balance
export const getBalance = async (address) => {
  try {
    const { provider } = await connectWallet();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

// Listen for account changes
export const addWalletListener = (setAddress) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      setAddress(accounts[0] || '');
    });
  }
};