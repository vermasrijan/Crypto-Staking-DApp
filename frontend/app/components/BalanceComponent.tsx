// BalanceComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const BalanceComponent = ({ tokenContract }: any) => {
  const [balanceAddress, setBalanceAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleBalanceOf = async () => {
    if (!balanceAddress) {
      setStatus("Address is required to fetch balance.");
      return;
    }
    try {
      setStatus("Fetching balance...");
      const balance = await tokenContract.balanceOf(balanceAddress);
      setUserBalance(ethers.utils.formatEther(balance));
      setStatus("Balance fetched!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Check Balance</h2>
      <div>
        <label className={styles.label}>Address to Check Balance</label>
        <input className={styles.input} value={balanceAddress} onChange={(e) => setBalanceAddress(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleBalanceOf}>
        Check Balance
      </button>
      <h3 className={styles.label}>Balance: {userBalance}</h3>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default BalanceComponent;
