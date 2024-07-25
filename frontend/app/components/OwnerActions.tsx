import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const OwnerActions = ({ stakingModuleContract }: any) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [addAmount, setAddAmount] = useState<string>("");
  const [apr, setApr] = useState<string>("");
  const [userStakeLimit, setUserStakeLimit] = useState<string>("");
  const [totalStakeLimit, setTotalStakeLimit] = useState<string>("");

  const [withdrawStatus, setWithdrawStatus] = useState<string>("");
  const [addStatus, setAddStatus] = useState<string>("");
  const [aprStatus, setAprStatus] = useState<string>("");
  const [userLimitStatus, setUserLimitStatus] = useState<string>("");
  const [totalLimitStatus, setTotalLimitStatus] = useState<string>("");

  const handleOwnerWithdrawTokens = async () => {
    try {
      setWithdrawStatus("Withdrawing tokens...");
      const tx = await stakingModuleContract.ownerWithdrawTokens(ethers.utils.parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawStatus("Tokens withdrawn successfully!");
    } catch (error: any) {
      console.error(error);
      setWithdrawStatus(`Error: ${error.message}`);
    }
  };

  const handleOwnerAddTokens = async () => {
    try {
      setAddStatus("Adding tokens...");
      const tx = await stakingModuleContract.ownerAddTokens(ethers.utils.parseEther(addAmount));
      await tx.wait();
      setAddStatus("Tokens added successfully!");
    } catch (error: any) {
      console.error(error);
      setAddStatus(`Error: ${error.message}`);
    }
  };

  const handleSetApr = async () => {
    try {
      setAprStatus("Setting APR...");
      const tx = await stakingModuleContract.changeApr(ethers.BigNumber.from(apr));
      await tx.wait();
      setAprStatus("APR set successfully!");
    } catch (error: any) {
      console.error(error);
      setAprStatus(`Error: ${error.message}`);
    }
  };

  const handleSetUserStakeLimit = async () => {
    try {
      setUserLimitStatus("Setting user stake limit...");
      const tx = await stakingModuleContract.setUserStakeLimit(ethers.BigNumber.from(userStakeLimit));
      await tx.wait();
      setUserLimitStatus("User stake limit set successfully!");
    } catch (error: any) {
      console.error(error);
      setUserLimitStatus(`Error: ${error.message}`);
    }
  };

  const handleSetTotalStakeLimit = async () => {
    try {
      setTotalLimitStatus("Setting total stake limit...");
      const tx = await stakingModuleContract.setTotalStakeLimit(ethers.BigNumber.from(totalStakeLimit));
      await tx.wait();
      setTotalLimitStatus("Total stake limit set successfully!");
    } catch (error: any) {
      console.error(error);
      setTotalLimitStatus(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Withdraw Tokens</h2>
        <div>
          <label className={styles.label}>Amount to Withdraw</label>
          <input className={styles.input} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
        </div>
        <button className={styles.button} onClick={handleOwnerWithdrawTokens}>
          Withdraw Tokens
        </button>
        <div className={styles.status}>{withdrawStatus}</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Tokens</h2>
        <div>
          <label className={styles.label}>Amount to Add</label>
          <input className={styles.input} value={addAmount} onChange={(e) => setAddAmount(e.target.value)} />
        </div>
        <button className={styles.button} onClick={handleOwnerAddTokens}>
          Add Tokens
        </button>
        <div className={styles.status}>{addStatus}</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Set APR</h2>
        <div>
          <label className={styles.label}>APR</label>
          <input className={styles.input} value={apr} onChange={(e) => setApr(e.target.value)} placeholder="Example: 1% is 100" />
        </div>
        <button className={styles.button} onClick={handleSetApr}>
          Set APR
        </button>
        <div className={styles.status}>{aprStatus}</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Set User Stake Limit</h2>
        <div>
          <label className={styles.label}>User Stake Limit</label>
          <input className={styles.input} value={userStakeLimit} onChange={(e) => setUserStakeLimit(e.target.value)} />
        </div>
        <button className={styles.button} onClick={handleSetUserStakeLimit}>
          Set User Stake Limit
        </button>
        <div className={styles.status}>{userLimitStatus}</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Set Total Stake Limit</h2>
        <div>
          <label className={styles.label}>Total Stake Limit</label>
          <input className={styles.input} value={totalStakeLimit} onChange={(e) => setTotalStakeLimit(e.target.value)} />
        </div>
        <button className={styles.button} onClick={handleSetTotalStakeLimit}>
          Set Total Stake Limit
        </button>
        <div className={styles.status}>{totalLimitStatus}</div>
      </section>
    </>
  );
};

export default OwnerActions;
