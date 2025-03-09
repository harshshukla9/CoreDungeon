/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALCHEMY_API_KEY: string;
  readonly VITE_WALLET_CONNECT_ID: string;
  readonly VITE_GAS_SPONSORSHIP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
