import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // CELO addresses
  // Alfajores testnet cUSD: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
  // CELO mainnet cUSD: 0x765DE816845861e75A25fCA122bb6bEB168b3DF4
  
  // Get addresses from environment or use defaults
  const cUSDAddress = process.env.CUSD_ADDRESS || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Alfajores default
  const charityWallet = process.env.CHARITY_WALLET || deployer.address; // Use deployer as default for testing

  console.log("\nDeploying DonnyRound contract...");
  console.log("cUSD Address:", cUSDAddress);
  console.log("Charity Wallet:", charityWallet);

  const DonnyRound = await ethers.getContractFactory("DonnyRound");
  const donnyRound = await DonnyRound.deploy(cUSDAddress, charityWallet);

  await donnyRound.waitForDeployment();

  const address = await donnyRound.getAddress();
  console.log("\n✅ DonnyRound deployed to:", address);
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network alfajores ${address} "${cUSDAddress}" "${charityWallet}"`);

  // Save deployment info
  console.log("\n📝 Deployment Info:");
  console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
  console.log("Contract Address:", address);
  console.log("cUSD Address:", cUSDAddress);
  console.log("Charity Wallet:", charityWallet);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



