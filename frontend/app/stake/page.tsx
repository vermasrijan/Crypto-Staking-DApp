"use client";

import StakingModule from "../../../artifacts/contracts/StakingModule.sol/StakingModule.json";
import Token from "../../../artifacts/contracts/Token.sol/Token.json";
import BalanceComponent from "../components/BalanceComponent";
import BurnComponent from "../components/BurnComponent";
import DescriptionDropdown from "../components/DescriptionDropdown";
import FetchStakingDetailsComponent from "../components/FetchStakingDetailsComponents";
import FetchTotalRewardsComponent from "../components/FetchTotalRewardComponents";
import MintComponent from "../components/MintComponent";
import OwnerActions from "../components/OwnerActions";
import StakeComponent from "../components/StakeComponent";
import TransferComponent from "../components/TransferComponent";
import UnstakeComponent from "../components/UnstakeComponent";
import ConnectWalletButton from "../connectWalletButton";
import styles from "../styles/Stake.module.css";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenAddress = searchParams.get("tokenAddress");
  const stakingModuleAddress = searchParams.get("stakingModuleAddress");
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [stakingModuleContract, setStakingModuleContract] = useState<ethers.Contract | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const fetchMetadata = async (tokenUri: string) => {
    try {
      const response = await axios.get(tokenUri);
      const metadata = response.data;
      setImageUrl(metadata.image);
      setDescription(metadata.description);
    } catch (error) {
      console.error("Error fetching token metadata:", error);
    }
  };

  const init = useCallback(async () => {
    if (window.ethereum && tokenAddress && stakingModuleAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);

      const tokenContract = new ethers.Contract(tokenAddress as string, Token.abi, signer);
      setTokenContract(tokenContract);

      const stakingModuleContract = new ethers.Contract(stakingModuleAddress as string, StakingModule.abi, signer);
      setStakingModuleContract(stakingModuleContract);

      try {
        const ownerAddress = await stakingModuleContract.owner();
        const userAddress = await signer.getAddress();
        setIsOwner(ownerAddress.toLowerCase() === userAddress.toLowerCase());
      } catch (error) {
        console.error("Error fetching owner:", error);
      }

      try {
        const tokenName = await tokenContract.name();
        setTokenName(tokenName);

        const tokenSymbol = await tokenContract.symbol();
        setTokenSymbol(tokenSymbol);

        const tokenUri = await tokenContract.tokenURI();
        fetchMetadata(tokenUri);
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    }
  }, [tokenAddress, stakingModuleAddress]);

  useEffect(() => {
    init();

    const handleAccountsChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [init]);

  return (
    <div className={styles.container}>
      <h1>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={tokenName}
            style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px" }}
          />
        )}
        Stake {tokenName} ({tokenSymbol}) Tokens
        <DescriptionDropdown description={description} /> 
      </h1>
      <ConnectWalletButton />
      {provider && signer && tokenContract && stakingModuleContract && (
        <>
          <StakeComponent
            tokenContract={tokenContract}
            stakingModuleContract={stakingModuleContract}
            stakingModuleAddress={stakingModuleAddress}
          />
          <UnstakeComponent stakingModuleContract={stakingModuleContract} signer={signer} />
          <MintComponent tokenContract={tokenContract} signer={signer} />
          <BurnComponent tokenContract={tokenContract} />
          <TransferComponent tokenContract={tokenContract} />
          <BalanceComponent tokenContract={tokenContract} />
          <FetchStakingDetailsComponent stakingModuleContract={stakingModuleContract} signer={signer} />
          <FetchTotalRewardsComponent stakingModuleContract={stakingModuleContract} signer={signer} />
          {isOwner && (
            <>
              <OwnerActions stakingModuleContract={stakingModuleContract} />
              {/* <UpdateTokenInfo tokenAddress={tokenAddress} /> */}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
