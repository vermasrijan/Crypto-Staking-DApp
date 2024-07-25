// FetchStakingDetailsComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const FetchStakingDetailsComponent = ({ stakingModuleContract, signer }: any) => {
  const [fetchIndex, setFetchIndex] = useState<string>("");
  const [stakingDetails, setStakingDetails] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  const fetchStakingDetails = async () => {
    try {
      const index = parseInt(fetchIndex, 10);
      if (isNaN(index)) {
        setStatus("Invalid index for fetching staking details.");
        return;
      }

      setStatus("Fetching staking details...");
      const details = await stakingModuleContract.getUserStake(await signer.getAddress(), index);
      setStakingDetails(details);

      setStatus("Staking details fetched!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Fetch Staking Details</h2>
      <div>
        <label className={styles.label}>Index of Stake to Fetch</label>
        <input className={styles.input} value={fetchIndex} onChange={(e) => setFetchIndex(e.target.value)} />
      </div>
      <button className={styles.button} onClick={fetchStakingDetails}>
        Fetch Staking Details
      </button>
      {stakingDetails && (
        <div>
          <h3>Staking Details</h3>
          <p>Amount: {ethers.utils.formatEther(stakingDetails.amount)}</p>
          <p>Start Time: {new Date(stakingDetails.startTime * 1000).toString()}</p>
          <p>Duration: {stakingDetails.duration.toString()}</p>
          <p>Withdrawn: {stakingDetails.withdrawn ? "Yes" : "No"}</p>
        </div>
      )}
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default FetchStakingDetailsComponent;
