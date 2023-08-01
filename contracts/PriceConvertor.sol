// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import from github -> importing AggregatorV3Interface.sol interface from github
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
library  PriceConvertor{
    
// get eth price
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256){
        // ABI
        // ADDRESS 0x694AA1769357215DE4FAC081bf1f309aDC325306
        (, int256 price,,,) =  priceFeed.latestRoundData();

        // ETH in usd
        return uint256(price*1e10);  //to match the 18 decimals becuase 1 eth = 1**18 wei
    }
    function getVersion() internal view returns(uint256){
           AggregatorV3Interface priceFedd = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
           return priceFedd.version();
    }

    function conversionRate(uint256 ethAmount,AggregatorV3Interface priceFeed) internal view  returns(uint256){
      uint256 ethPrice = getPrice(priceFeed);
      uint256  ethAmountInUsd = (ethAmount*ethPrice)/1e18;
      return ethAmountInUsd;
    }
}