// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {DarkestDungeon} from "../src/DarkestDungeon.sol";
import {Dungeon} from "../src/Token/Gametoken.sol"; // Import the Dungeon token contract

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = 0x780318955e96b181cf4796b9e423b101d564bd041f447beedf9fc84df560035b;
       address deployerAddress = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts using deployer address:", deployerAddress);

        address gasbackAddress = 0xdF329d59bC797907703F7c198dDA2d770fC45034;

        // Deploy Dungeon Token first
        Dungeon dungeonToken = new Dungeon();
        console.log("Deployed Dungeon Token at address: %s", address(dungeonToken));

        // Deploy DarkestDungeon with Dungeon token address
        DarkestDungeon game = new DarkestDungeon(deployerAddress, gasbackAddress, address(dungeonToken));
        console.log("Deployed Darkest Dungeon at address: %s", address(game));

        vm.stopBroadcast();
    }
}
// forge script script/Deploy.s.sol https://rpc.test.btcs.network/ --private-key 780318955e96b181cf4796b9e423b101d564bd041f447beedf9fc84df560035b --broadcast

// forge script script/Deploy.s.sol https://rpc.test.btcs.network/  --broadcast