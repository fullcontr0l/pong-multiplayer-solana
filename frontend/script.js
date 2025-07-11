import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram } from "https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm";

const connectBtn = document.getElementById("connectWalletBtn");
const payBtn = document.getElementById("payBtn");
const status = document.getElementById("status");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const gameWallet = new PublicKey("YOUR_GAME_WALLET_ADDRESS"); // Replace
let playerPublicKey = null;

const socket = io();

connectBtn.onclick = async () => {
  try {
    const resp = await window.solana.connect();
    playerPublicKey = resp.publicKey;
    status.textContent = "Connected: " + playerPublicKey.toString();
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
  }
};

payBtn.onclick = async () => {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: playerPublicKey,
        toPubkey: gameWallet,
        lamports: 0.05 * 1e9,
      })
    );
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    status.textContent = "Payment confirmed. Waiting for opponent...";
    socket.emit("join-game", playerPublicKey.toString());
  } catch (err) {
    console.error(err);
  }
};

// Multiplayer game logic would go here (receiving updates from socket and rendering)
