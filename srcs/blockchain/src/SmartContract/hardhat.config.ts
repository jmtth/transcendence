// import { defineConfig } from "hardhat/config";
// import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
// import hardhatEthers from "@nomicfoundation/hardhat-ethers";
// import hardhatTypechain from "@nomicfoundation/hardhat-typechain";
// import hardhatMocha from "@nomicfoundation/hardhat-mocha";
// import hardhatEthersChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";
// import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
// import "@nomicfoundation/hardhat-igniton";
// import "@nomicfoundation/hardhat-ethers";
// import "@nomicfoudation/hardhat-ignition-viem";
import { defineConfig } from "hardhat/config";
import hardhatIgnitionViemPlugin from "@nomicfoundation/hardhat-ignition-viem";

//* export default defineConfig({
//   plugins: [hardhatIgnitionViemPlugin],
//   // ... rest of your config
// });

export default defineConfig({
  // plugins: [
  //   hardhatToolboxViemPlugin,],
  //   hardhatEthers,
  //   hardhatTypechain,
  //   hardhatMocha, 
  //   hardhatEthersChaiMatchers,
  //   hardhatNetworkHelpers,],
  plugins: [hardhatIgnitionViemPlugin],
  solidity: {
    version: "0.8.28",
  },
  // test: {
  //   // Désactive complètement l’exécution des tests Node.js (node:test)
  //   disableNodeTest: false,
  // },
  // mocha: {
  //   // Si vous utilisez un chemin non standard pour les tests Solidity (e.g. .t.sol),
  //   // cela devrait isoler les tests TypeScript/Mocha
  //   files: "test-mocha/*.ts",
  //   timeout: 40000,
  // },
});
