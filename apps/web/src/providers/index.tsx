import type { PropsWithChildren } from 'react';
import CustomRainbowKitProvider from './alchemy-provider';



export const ProviderTree = ({ children }: PropsWithChildren) => {
  return <CustomRainbowKitProvider>{children}</CustomRainbowKitProvider>;
};
