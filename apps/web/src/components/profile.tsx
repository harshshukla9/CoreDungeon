import { gameContract } from '~/lib/alchemy';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ProfileTable } from './profile-table';

export const ProfileDetails = () => {
 
  const { address} = useAccount();
  if(!address) return;
   const { data: profileData, refetch: getProfileData } = useReadContract({
      abi: gameContract.abi,
      address: gameContract.address as `0x${string}`,
      functionName: 'getPlayRecords',
      args: [address],
    });
  
    console.log("leaderborard",profileData)
  

  

  return (
    <div className='absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-6'>
      <div className='font-golondrina text-7xl'>Profile Details</div>
      <ProfileTable
        // @ts-expect-error -- safe for read-only
        data={profileData ?? []}
      />
    </div>
  );
};
