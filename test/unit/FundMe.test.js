const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")

const {developmentChains} = require("../../helper-hardhat-config")
!developmentChains.includes(network.name) ? 
describe.skip
:
describe("FundeMe", async () => {

    let fundMe
    let deployer
    let mockV3Aggreagtor

    const sendVal = ethers.parseUnits("1.0", "ether") //1eth

    beforeEach(async () => {
        // deploy our fundme contract using  hardhat deploy
        // using Hardhat Deploy


        // deployments.fixture 
        // fixture -> allow us to deploy our entire folder with as many tag as we want

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer) // will give us most recent deployed fundme contract
        mockV3Aggreagtor = await ethers.getContract("MockV3Aggregator", deployer)
    })

    // test 1
    describe("constructor", async () => {
        it("Sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            // assert.equal(response, mockV3Aggreagtor.address) X
            assert.equal(response, mockV3Aggreagtor.target)   // :}
        })
    })

    // test 2
    describe("fund", async () => {
        it("Fails if you don't send enough eths", async () => {
            // testing if transaction was reverted
            await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough")
        })

        it("update the amount funded data structure", async () => {
            await fundMe.fund({ value: sendVal })
            const response = await fundMe.getAddressToAmmountFunded(deployer)
            assert.equal(response.toString(), sendVal.toString())
        })

        it("Add s_funders to s_funders array", async () => {
            await fundMe.fund({ value: sendVal })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })

    // test 3
    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendVal })
        })

        it("withdraw ETH from a sigle person", async () => {
            // Arrange
            // console.log(fundMe)
            const startingBal = await ethers.provider.getBalance(fundMe.target)
            const startingDeployerBal = await ethers.provider.getBalance(deployer)
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gascost = gasUsed * (gasPrice)
            const endingBal = await ethers.provider.getBalance(fundMe.target)
            const endingDoployerBal = await ethers.provider.getBalance(deployer)

            // gascost

            // Assert
            assert.equal(endingBal, 0)
            assert.equal((startingBal + startingDeployerBal).toString(), (endingDoployerBal + gascost).toString())
        })

        it("allows us to withdraw with multiple s_funders", async () => {
            // arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMe.fund({ value: sendVal })
            }
            const startingBal = await ethers.provider.getBalance(fundMe.target)
            const startingDeployerBal = await ethers.provider.getBalance(deployer)

            // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gascost = gasUsed * (gasPrice)
            const endingBal = await ethers.provider.getBalance(fundMe.target)
            const endingDoployerBal = await ethers.provider.getBalance(deployer)

            // Assert
            assert.equal(endingBal, 0)
            assert.equal((startingBal + startingDeployerBal).toString(), (endingDoployerBal + gascost).toString())
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (i = 1; i < 6; i++) {
                const addressToFund = await fundMe.getAddressToAmmountFunded(accounts[i].address)
                assert.equal(addressToFund, 0)
            }
        })

        it("cheaperWithdraw tetsing.... ", async () => {
            // arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMe.fund({ value: sendVal })
            }
            const startingBal = await ethers.provider.getBalance(fundMe.target)
            const startingDeployerBal = await ethers.provider.getBalance(deployer)

            // act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gascost = gasUsed * (gasPrice)
            const endingBal = await ethers.provider.getBalance(fundMe.target)
            const endingDoployerBal = await ethers.provider.getBalance(deployer)

            // Assert
            assert.equal(endingBal, 0)
            assert.equal((startingBal + startingDeployerBal).toString(), (endingDoployerBal + gascost).toString())
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (i = 1; i < 6; i++) {
                const addressToFund = await fundMe.getAddressToAmmountFunded(accounts[i].address)
                assert.equal(addressToFund, 0)
            }
        })


        it("only allow the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
    })
})
