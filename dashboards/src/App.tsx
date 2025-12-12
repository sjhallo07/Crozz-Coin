import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { Dashboard } from "./components/Dashboard";

const networks: Record<string, { url: string }> = {
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
};

function App() {
  return (
    <WalletProvider>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <Dashboard />
      </SuiClientProvider>
    </WalletProvider>
  );
}

export default App;
