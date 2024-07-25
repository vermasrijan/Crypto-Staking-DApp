// TransferComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const TransferComponent = ({ tokenContract }: any) => {
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleTransfer = async () => {
    try {
      setStatus("Transferring tokens...");
      const tx = await tokenContract.transfer(toAddress, ethers.utils.parseEther(amount));
      await tx.wait();

      setStatus("Transfer successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Transfer Tokens</h2>
      <div>
        <label className={styles.label}>Recipient Address</label>
        <input className={styles.input} value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
      </div>
      <div>
        <label className={styles.label}>Amount</label>
        <input className={styles.input} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleTransfer}>
        Transfer
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default TransferComponent;
