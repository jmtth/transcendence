import { ethers } from "ethers";
import fs from "fs";
import path from "path";

let _gameStorage: ethers.Contract | null = null;

export function getGameStorage(): ethers.Contract | null {
  const blockchainReady = process.env.BLOCKCHAIN_READY === "true";
  if(!blockchainReady)
    return null;

  if (_gameStorage) {
    return _gameStorage;
  }

  const requiredEnv = [
    "GAME_STORAGE_ADDRESS",
    "AVALANCHE_RPC_URL",
    "BLOCKCHAIN_PRIVATE_KEY",
  ] as const;

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`${key} is not defined`);
    }
  }

  const abiPath = path.resolve(process.cwd(), "abi/GameStorage.json");
  const GameStorageAbi = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

  const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, provider);

  _gameStorage = new ethers.Contract(
    process.env.GAME_STORAGE_ADDRESS!,
    GameStorageAbi,
    wallet
  );

  return _gameStorage;
}

