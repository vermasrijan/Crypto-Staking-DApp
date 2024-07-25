"use client";

import styles from ".//styles/Home.module.css";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const navigateToDeploy = () => {
    router.push("/deploy");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Staking DApp</h1>
      <button className={styles.button} onClick={navigateToDeploy}>
        Deploy Contracts
      </button>
    </div>
  );
}
