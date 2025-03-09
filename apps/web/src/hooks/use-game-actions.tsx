import { gameContract } from '~/lib/alchemy';
import { tokenContract } from '~/lib/alchemy'; // Ensure the correct contract import
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';

export interface StoreArgs {
  id: string;
  totalScore: bigint;
  times: { startTime: bigint; endTime: bigint; round: bigint }[];
}

export const useGameActions = () => {
  const { address, isConnecting:isLoadingClient, isDisconnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  // Ensure function always returns an object
  if (!address) {
    return {
      storeResult: async () => {
        throw new Error('No address connected');
      },
      isMinting,
      isLoadingClient,
      isDisconnected,
      getProfileData: async () => undefined,
      profileData: undefined,
    };
  }

  // ✅ Fetch Profile Data using `useReadContract`
  const { data: profileData, refetch: getProfileData } = useReadContract({
    abi: gameContract.abi,
    address: gameContract.address as `0x${string}`,
    functionName: 'getPlayRecords',
    args: [address],
  });

  console.log("Leaderboard:", profileData);

  // ✅ Send Transaction using `useWriteContract`
  const { writeContractAsync } = useWriteContract();

  const storeResult = async (args: StoreArgs) => {
    console.log("Stats:", args.totalScore);

    const tx = await writeContractAsync({
      abi: gameContract.abi,
      address: gameContract.address as `0x${string}`,
      functionName: 'addPlayScore',
      args: [
        {
          id: args.id,
          totalScore: args.totalScore,
          totalRounds: BigInt(args.times.length),
          timestamp: BigInt(Date.now()),
        },
        args.times,
        address,
      ],
    });

    console.log("Game result stored:", tx);
    await mintToken(args.totalScore);
    return tx as `0x${string}`;
  };

  const mintToken = async (score: bigint) => {
    try {
      setIsMinting(true);
      console.log("Minting token based on score:", score);

      const mintTx = await writeContractAsync({
        abi: tokenContract.abi,
        address: tokenContract.address as `0x${string}`,
        functionName: 'mintToken',
        args: [address, score],
      });
      console.log("Minting successful:", mintTx);
      return mintTx as `0x${string}`;
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return { storeResult, isMinting, isLoadingClient, isDisconnected, getProfileData, profileData };
};

