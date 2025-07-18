// frontend/src/components/Login.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export default function Login() {
  const [wallet, setWallet] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // 1. Connect wallet
  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWallet(accounts[0]);
  }

  // 2. Trigger login with signature
  async function loginWithSignature() {
    try {
      // Fetch nonce
      const nonceRes = await axios.post('http://localhost:4000/api/auth/nonce', { address: wallet });
      const nonce = nonceRes.data.nonce;

      // Sign nonce
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // Verify signature
      const verifyRes = await axios.post('http://localhost:4000/api/auth/verify', {
        address: wallet,
        signature,
      });

      if (verifyRes.data.success) {
        setLoggedIn(true);
        alert("Login Successful ✅");
      } else {
        alert("Signature verification failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Auth failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : !loggedIn ? (
        <>
          <p>Wallet: {wallet}</p>
          <button onClick={loginWithSignature}>Sign to Login</button>
        </>
      ) : (
        <h3>✅ Logged in as {wallet}</h3>
      )}
    </div>
  );
}
