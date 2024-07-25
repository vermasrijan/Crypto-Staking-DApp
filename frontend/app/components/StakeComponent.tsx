// StakeComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const StakeComponent = ({ tokenContract, stakingModuleContract, stakingModuleAddress }: any) => {
  const [amount, setAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleStake = async () => {
    try {
      setStatus("Approving token...");
      const tx1 = await tokenContract.approve(stakingModuleAddress, ethers.utils.parseEther(amount));
      await tx1.wait();

      setStatus("Staking tokens...");
      const tx2 = await stakingModuleContract.stake(ethers.utils.parseEther(amount), duration);
      await tx2.wait();

      setStatus("Staking successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Staking</h2>
      <div>
        <label className={styles.label}>Amount</label>
        <input className={styles.input} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label className={styles.label}>Duration (in seconds)</label>
        <input className={styles.input} value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleStake}>
        Stake
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default StakeComponent;
