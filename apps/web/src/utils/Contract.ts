import { defineChain } from 'viem'

export const coreDaoTestnet = defineChain({
    id: 1115,
    name: "Core DAO Testnet",
    network: "coredao-testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Core",
      symbol: "tCORE",
    },
    rpcUrls: {
      default: {
        http: ["https://rpc.test.btcs.network"],
      },
      public: {
        http: ["https://rpc.test.btcs.network"],
      },
    },
    blockExplorers: {
      default: { name: "CoreDAO Explorer", url: "https://scan.test.btcs.network" },
    },
    testnet: true,
  });