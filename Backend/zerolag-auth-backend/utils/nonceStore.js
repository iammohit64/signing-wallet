// For demo: in-memory storage
const nonceStore = new Map();

// Save nonce for a given wallet address
export const setNonce = (address, nonce) => {
  nonceStore.set(address.toLowerCase(), nonce);
};

// Get the stored nonce for an address
export const getNonce = (address) => {
  return nonceStore.get(address.toLowerCase());
};

// Clear nonce once verified
export const clearNonce = (address) => {
  nonceStore.delete(address.toLowerCase());
};
