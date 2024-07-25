// MintComponent.tsx
import styles from "../styles/Stake.module.css";
import { ethers } from "ethers";
import { useState } from "react";

const MintComponent = ({ tokenContract, signer }: any) => {
  const [mintAmount, setMintAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleMint = async () => {
    try {
      setStatus("Minting tokens...");
      const tx = await tokenContract.mint(await signer.getAddress(), ethers.utils.parseEther(mintAmount));
      await tx.wait();

      setStatus("Minting successful!");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Mint Tokens</h2>
      <div>
        <label className={styles.label}>Mint Amount</label>
        <input className={styles.input} value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
      </div>
      <button className={styles.button} onClick={handleMint}>
        Mint
      </button>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default MintComponent;
