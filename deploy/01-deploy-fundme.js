// function deployFunc(hre){
// }
// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const network = require("hardhat");
const { verify } = require("../utils/verify");


module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts() //add namedAccounts field inside the hardhat.config.js
    const chainId = network.network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.network.name)) {
        // local development chain
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // mainnet / testnet chain
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const args = [ethUsdPriceFeedAddress,]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true, 
        waitConfirmation: network.network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.network.name) && process.env.ETHERSCAN_API) {
        //   VERIFY
        await verify(fundMe.address, args)
    }
    console.log("---------------------------------------")
}

module.exports.tags = ["all", "fundme"]

