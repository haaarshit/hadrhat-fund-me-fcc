const { version } = require("chai")
require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("hardhat-deploy")
require("hardhat-gas-reporter")

/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY = process.env.PRIVATE_KEY
const RPC_URL = process.env.RPC_URL
const EtherscanApi = process.env.ETHERSCAN_API || "key"
module.exports = {
  defaultNetwork: "hardhat",

  networks: {
    sepolia:
    {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    }
  },
  // solidity: "^0.6.0",
  solidity: {
    compilers: [
      { version: "0.8.8" },
      { version: "0.6.6" },
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  },
  etherscan: {
    apiKey: {
      sepolia: EtherscanApi
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true
  }
}

