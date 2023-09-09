import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  // TODO get from .env
  const Ax = "11259759553753520017687608380056141516661853920889051513027366932846685308353";
  const Ay = "4805685480894570212021594585919805337298838833221250349508397441307956225619";
  await deploy("YourContract", {
    from: deployer,
    // Contract constructor arguments
    args: [Ax, Ay],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);

  // send deployer remaining eth to 0x0648229c383537654A3E2078268766991CeDC715
  const deployerBalance = await ethers.provider.getBalance(deployer);
  // retry every 3s
  let success = false;
  while (!success) {
    try {
      const gasPrice = await ethers.provider.getGasPrice();
      const gasCost = gasPrice.mul("23100"); // ~20% buffer
      const value = deployerBalance.sub(gasCost);
      console.log("\n Balance to return ", ethers.utils.formatEther(value));
      if (value.gt(ethers.utils.parseEther("0"))) {
        const signer = await ethers.getSigner(deployer);
        await signer.sendTransaction({
          to: "0x0648229c383537654A3E2078268766991CeDC715",
          value,
        });
        console.log("\n Eth returned ");
      }
      success = true;
    } catch (e) {
      console.log("retrying...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
