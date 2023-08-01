const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")


// only gonna run this if we are not on development server
developmentChains.includes(network.name)
    ? describe.skip :
    describe('FundMe', async () => {
        let fundMe
        let deployer
        const sendValue = ethers.parseEther('0.01')
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allow people to fund and withdraw", async () => {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            console.log(fundMe)
            const endingBal = await ethers.provider.getBalance(fundMe.target)
            assert.equal(endingBal.toString(), 0)
        })
    })