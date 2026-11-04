import {
  http,
  createConfig,
  cookieStorage,
  createStorage,
  cookieToInitialState,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  walletConnect,
  coinbaseWallet,
  safe,
  injected,
} from "wagmi/connectors";
import { CHAIN_ID } from "@/constants/env";
import { getChain } from "@/utils/chains";

const chain = getChain(CHAIN_ID);

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID?.trim() || null;

export const getJsonRpcUrl = (chainId) => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL?.trim();
  if (rpcUrl && chainId === CHAIN_ID) {
    let url;
    try {
      url = new URL(rpcUrl);
    } catch {
      throw new Error("NEXT_PUBLIC_RPC_URL must be a valid HTTP(S) RPC URL");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error("NEXT_PUBLIC_RPC_URL must use HTTP or HTTPS");
    return rpcUrl;
  }

  switch (chainId) {
    case mainnet.id:
      return `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    case sepolia.id:
      return `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    default:
      throw new Error();
  }
};

export const config = createConfig({
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  syncConnectedChain: false,
  chains: [chain],
  connectors: [
    // WalletConnect só entra se houver project ID (Reown Cloud, gratuito)
    ...(walletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId })]
      : []),
    coinbaseWallet({ appName: "Nouns TV Camp" }),
    safe(),
    injected(),
  ],
  transports: {
    [chain.id]: http(getJsonRpcUrl(chain.id)),
  },
  batch: {
    multicall: {
      wait: 50,
      batchSize: 1024 * 8, // 8kb seems to be the max size for cloudflare
    },
  },
});

export const getStateFromCookie = (cookie) =>
  cookieToInitialState(config, cookie);
