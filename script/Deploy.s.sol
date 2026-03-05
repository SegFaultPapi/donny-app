// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DonnyRound} from "../src/DonnyRound.sol";

contract DeployScript is Script {
    function run() public returns (DonnyRound round) {
        // Alfajores cUSD: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
        address cUSD = vm.envAddress("CUSD_ADDRESS");
        address charityWallet = vm.envAddress("CHARITY_WALLET");
        require(cUSD != address(0), "Set CUSD_ADDRESS in .env");
        require(charityWallet != address(0), "Set CHARITY_WALLET in .env");

        vm.startBroadcast();
        round = new DonnyRound(cUSD, charityWallet);
        vm.stopBroadcast();
    }
}
