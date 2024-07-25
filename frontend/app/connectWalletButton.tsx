import styles from ".//styles/page.module.css";
import { ethers } from "ethers";
import React, { useState } from "react";

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

const ConnectWalletButton: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setConnected(true);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <button className={styles.buttonWallet} onClick={connectWallet}>
      {connected ? `Connected: ${account.slice(0, 10)}...` : "Connect Wallet"}
    </button>
  );
};

export default ConnectWalletButton;
