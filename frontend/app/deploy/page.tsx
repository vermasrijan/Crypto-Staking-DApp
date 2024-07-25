"use client";

import StakingModule from "../../../artifacts/contracts/StakingModule.sol/StakingModule.json";
import Token from "../../../artifacts/contracts/Token.sol/Token.json";
import ConnectWalletButton from "../connectWalletButton";
import styles from "../styles/page.module.css";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import { FaChevronDown } from "react-icons/fa";

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

const networkOptions = [
  { value: "sepolia", label: "Sepolia" },
  { value: "mainnet", label: "Mainnet" },
  // { value: "mumbai", label: "Polygon Mumbai" },
];

interface NetworkConfig {
  [key: string]: { chainId: string };
}

const networkConfig: NetworkConfig = {
  mainnet: { chainId: "0x1" },
  sepolia: { chainId: "0xAA36A7" },
 // mumbai: { chainId: "0x13881" },
};

export default function Home() {
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [initialSupply, setInitialSupply] = useState<string>("");
  const [apRate, setApRate] = useState<string>("");
  const [userStakeLimit, setUserStakeLimit] = useState<string>("");
  const [totalStakeLimit, setTotalStakeLimit] = useState<string>("");
  const [maxNumStakes, setMaxNumStakes] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>(networkOptions[0].value);
  const router = useRouter();

  const handleSwitchNetwork = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const targetChainId = networkConfig[selectedNetwork].chainId;
    
        await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainId }]);
    
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const newNetwork = await newProvider.getNetwork();
    
        if (newNetwork.chainId === parseInt(targetChainId, 16)) {
          setStatus(`Switched to ${selectedNetwork} network`);
        } else {
          setStatus(`Failed to switch to the ${selectedNetwork} network. Please try again.`);
        }
      } catch (error: any) {
        console.error("Error details:", error);
    
        if (error.code === 4902) {
          setStatus("Network not available in MetaMask. Please add it manually.");
        } else {
          setStatus(`Error: ${error.message}`);
        }
      }
    };

  const uploadImageToPinata = async (file: File) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const apiKey = "0e7883073454b6926a88"; // Replace with your Pinata API Key
    const apiSecret = "056437bc03047d76bab5aabaaf372a05351ea1c46e534963b943e1fd17792957"; // Replace with your Pinata Secret API Key


    // const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    // const apiKey = process.env.PINATA_API_KEY;
    // const apiSecret = process.env.PINATA_API_SECRET;

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData}`,
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  };

  const uploadMetadataToPinata = async (name: string, description: string, imageUrl: string) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const apiKey = "0e7883073454b6926a88"; // Replace with your Pinata API Key
    const apiSecret = "056437bc03047d76bab5aabaaf372a05351ea1c46e534963b943e1fd17792957"; // Replace with your Pinata Secret API Key


    // const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    // const apiKey = process.env.PINATA_API_KEY;
    // const apiSecret = process.env.PINATA_API_SECRET;

    const metadata = {
      name,
      description,
      image: imageUrl,
    };

    const response = await axios.post(url, metadata, {
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  };

  const handleDeploy = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    if (!imageFile) {
      setStatus("Please upload an image.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      setStatus("Uploading image to IPFS...");
      const imageUrl = await uploadImageToPinata(imageFile);

      setStatus("Uploading metadata to IPFS...");
      const metadataURL = await uploadMetadataToPinata(tokenName, description, imageUrl);

      setStatus("Deploying Token contract...");
      const TokenFactory = new ethers.ContractFactory(Token.abi, Token.bytecode, signer);
      const tokenContract = await TokenFactory.deploy(
        ethers.utils.parseEther(initialSupply),
        await signer.getAddress(),
        tokenName,
        tokenSymbol,
        metadataURL,
      );
      await tokenContract.deployed();

      setStatus(`Token contract deployed at ${tokenContract.address}`);

      setStatus("Deploying StakingModule contract...");
      const StakingModuleFactory = new ethers.ContractFactory(StakingModule.abi, StakingModule.bytecode, signer);
      const stakingModuleContract = await StakingModuleFactory.deploy(
        tokenContract.address,
        apRate,
        await signer.getAddress(),
        ethers.utils.parseEther(userStakeLimit),
        ethers.utils.parseEther(totalStakeLimit),
        maxNumStakes,
      );
      await stakingModuleContract.deployed();

      setStatus(`StakingModule contract deployed at ${stakingModuleContract.address}`);

      router.push(`/stake?tokenAddress=${tokenContract.address}&stakingModuleAddress=${stakingModuleContract.address}`);
    } catch (error: any) {
      console.error("Error details:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedNetwork(event.target.value);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Deploy Staking Contracts</h1>
      <ConnectWalletButton />
      <div className={styles.formGroup}>
        <label className={styles.label}>Network</label>
        <div className={styles.selectContainer}>
          <select className={styles.select} value={selectedNetwork} onChange={handleNetworkChange}>
            {networkOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className={styles.selectIcon} />
        </div>
        <button className={styles.smallButton} onClick={handleSwitchNetwork}>
          Switch
        </button>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Token Name</label>
        <input className={styles.input} value={tokenName} onChange={handleInputChange(setTokenName)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Token Symbol</label>
        <input className={styles.input} value={tokenSymbol} onChange={handleInputChange(setTokenSymbol)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Initial Supply</label>
        <input className={styles.input} value={initialSupply} onChange={handleInputChange(setInitialSupply)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <input className={styles.input} value={description} onChange={handleInputChange(setDescription)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Image</label>
        <input className={styles.input} type="file" onChange={handleFileChange} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>APR</label>
        <input className={styles.input} value={apRate} onChange={handleInputChange(setApRate )}  placeholder="Example: 1% is 100"  />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>User Stake Limit</label>
        <input className={styles.input} value={userStakeLimit} onChange={handleInputChange(setUserStakeLimit)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Total Stake Limit</label>
        <input className={styles.input} value={totalStakeLimit} onChange={handleInputChange(setTotalStakeLimit)} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Max Number of Stakes per User</label>
        <input className={styles.input} value={maxNumStakes} onChange={handleInputChange(setMaxNumStakes)} />
      </div>
      <button className={styles.button} onClick={handleDeploy}>
        Deploy
      </button>
      <div className={styles.status}>{status}</div>
    </div>
  );
}
