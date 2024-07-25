// UnstakeComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const UnstakeComponent = ({ stakingModuleContract, signer }: any) => {
  const [indexOfStake, setIndexOfStake] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleUnstake = async () => {
    try {
      setStatus("Unstaking tokens...");

      const index = parseInt(indexOfStake, 10);
      if (isNaN(index) || index < 0) {
        setStatus("Invalid stake index.");
        return;
      }

      const details = await stakingModuleContract.getUserStake(await signer.getAddress(), index);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < details.startTime.add(details.duration).toNumber()) {
        setStatus("Staking period is not over yet.");
        return;
      }

      const tx = await stakingModuleContract.unstake(index);
      await tx.wait();

      setStatus("Unstaking successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Unstake</h2>
      <div>
        <label className={styles.label}>Index of Stake</label>
        <input className={styles.input} value={indexOfStake} onChange={(e) => setIndexOfStake(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleUnstake}>
        Unstake
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default UnstakeComponent;
