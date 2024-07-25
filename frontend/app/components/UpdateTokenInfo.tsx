import styles from "../styles/Stake.module.css";
import { useState } from "react";

interface UpdateTokenInfoProps {
  tokenAddress: string;
}

const UpdateTokenInfo: React.FC<UpdateTokenInfoProps> = ({ tokenAddress }) => {
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenSymbol, setNewTokenSymbol] = useState("");
  const [status, setStatus] = useState("");

  const updateTokenInfo = async (field: string, value: string) => {
    try {
      const response = await fetch("http://localhost:3001/update-token-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress: tokenAddress,
          functionName: field, // "0x06fdde03" for name and "0x95d89b41" for symbol (encoded function selectors)
          newValue: value,
        }),
      });
      const data = await response.json();
      setStatus(data.message);
    } catch (error) {
      setStatus("An error occurred while updating token information");
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Update Token Information</h2>
      <div>
        <label className={styles.label}>New Token Name</label>
        <input
          className={styles.input}
          type="text"
          value={newTokenName}
          onChange={(e) => setNewTokenName(e.target.value)}
        />
        <button className={styles.button} onClick={() => updateTokenInfo("0x06fdde03", newTokenName)}>
          Update Token Name
        </button>
      </div>
      <div>
        <label className={styles.label}>New Token Symbol</label>
        <input
          className={styles.input}
          type="text"
          value={newTokenSymbol}
          onChange={(e) => setNewTokenSymbol(e.target.value)}
        />
        <button className={styles.button} onClick={() => updateTokenInfo("0x95d89b41", newTokenSymbol)}>
          Update Token Symbol
        </button>
      </div>
      <div className={styles.status}>{status}</div>
    </section>
  );
};

export default UpdateTokenInfo;
