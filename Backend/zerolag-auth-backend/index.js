// index.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { setNonce, getNonce, clearNonce } from './utils/nonceStore.js';
import crypto from 'crypto';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

/**
 * Route: POST /api/auth/nonce
 * Input: { address }
 * Output: { nonce }
 */
app.post('/api/auth/nonce', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address missing' });

  const nonce = 'Sign this message: ' + crypto.randomBytes(16).toString('hex');
  setNonce(address, nonce);

  res.json({ nonce });
});

/**
 * Route: POST /api/auth/verify
 * Input: { address, signature }
 * Output: { success, message }
 */
app.post('/api/auth/verify', (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature) return res.status(400).json({ error: 'Missing data' });

  const nonce = getNonce(address);
  if (!nonce) return res.status(400).json({ error: 'No nonce found' });

  try {
    const recoveredAddress = ethers.utils.verifyMessage(nonce, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    clearNonce(address);

    // Success — user owns this wallet
    return res.json({
      success: true,
      user: {
        address,
        authenticated: true
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth backend running at http://localhost:${PORT}`);
});
