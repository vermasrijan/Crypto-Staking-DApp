// BurnComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const BurnComponent = ({ tokenContract }: any) => {
  const [burnAmount, setBurnAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleBurn = async () => {
    try {
      setStatus("Burning tokens...");
      const tx = await tokenContract.burn(ethers.utils.parseEther(burnAmount));
      await tx.wait();

      setStatus("Burning successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Burn Tokens</h2>
      <div>
        <label className={styles.label}>Burn Amount</label>
        <input className={styles.input} value={burnAmount} onChange={(e) => setBurnAmount(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleBurn}>
        Burn
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default BurnComponent;
