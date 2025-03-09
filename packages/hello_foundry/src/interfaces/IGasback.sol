// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGasback {
    function register(address _nftRecipient, address _smartContract) external returns (uint256 tokenId);
}
