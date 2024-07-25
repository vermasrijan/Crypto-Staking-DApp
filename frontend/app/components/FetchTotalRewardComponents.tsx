// FetchTotalRewardsComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const FetchTotalRewardsComponent = ({ stakingModuleContract, signer }: any) => {
  const [status, setStatus] = useState<string>("");

  const fetchTotalRewards = async () => {
    try {
      setStatus("Fetching total rewards...");
      const rewards = await stakingModuleContract.getTotalRewards(await signer.getAddress());
      setStatus(`Total rewards: ${ethers.utils.formatEther(rewards)}`);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Total Stake Reward</h2>
      <button className={styles.button} onClick={fetchTotalRewards}>
        Fetch Total Rewards
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default FetchTotalRewardsComponent;
