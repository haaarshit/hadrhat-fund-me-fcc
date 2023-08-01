// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./PriceConvertor.sol";
import "hardhat/console.sol";
error FundMe__notOwner();

/**
 * @title  A contract for crowd funding
 * @author Harshit Tripathi
 * @notice This contract is to demo a sample fundme contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    using PriceConvertor for uint256;

    // State varibales
    uint256 public num;
    address private immutable i_owner;
    uint256 public constant minimumUsd = 1 * 1e18;
    AggregatorV3Interface private s_priceFeed;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmoutntFunded;

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__notOwner();
        }
        _;
    }

    // constructor
    constructor(address priceFeedAddress) {
        i_owner= msg.sender;
        s_priceFeed= AggregatorV3Interface(priceFeedAddress);
    }

    // receive and fallback
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // external functtion
    // internel function

    // public functions

     /**
      * @notice  This function funds this contract
      * @dev  This implements price feeds as our library
      */
    function fund() public payable {
        num = 5;

        require(
            msg.value.conversionRate(s_priceFeed) >= minimumUsd,
            "Didn't send enough"
        ); // 1e18 = 1*10**18 -> this much gwei is one eth
        s_funders.push(msg.sender);
        s_addressToAmoutntFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner{
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmoutntFunded[funder] = 0;
        }

        // resetting an array
        s_funders = new address[](0); //new array with zero objects inside

        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public onlyOwner{
        address[] memory funders = s_funders;
        // mapping can't be in memory
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
             address funder = s_funders[funderIndex];
            s_addressToAmoutntFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success,)=i_owner.call{value:address(this).balance}("");
        require(success);
    }

    // get owner
    function getOwner() public view returns(address){
        return i_owner;
    }
    // get funder
    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }
    // get amount funded
    function getAddressToAmmountFunded(address funder) public view returns(uint256) {
        return s_addressToAmoutntFunded[funder];
    }
    // returns pricefeed
    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }
}
