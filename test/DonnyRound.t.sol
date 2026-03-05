// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DonnyRound} from "../src/DonnyRound.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract DonnyRoundTest is Test {
    DonnyRound public round;
    MockERC20 public cUSD;

    address public charityWallet;
    address public alice;
    address public bob;
    address public carol;

    uint256 constant ENTRY_FEE = 2 * 1e18;

    function setUp() public {
        charityWallet = makeAddr("charity");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");

        cUSD = new MockERC20("Celo USD", "cUSD", 18);
        round = new DonnyRound(address(cUSD), charityWallet);

        // Mint cUSD to players (e.g. 100 each)
        cUSD.mint(alice, 100 * 1e18);
        cUSD.mint(bob, 100 * 1e18);
        cUSD.mint(carol, 100 * 1e18);
    }

    function test_EnterRound_FirstPlayerStartsRound() public {
        vm.startPrank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        round.enterRound();
        vm.stopPrank();

        assertTrue(round.hasEntered(alice));
        assertEq(round.taps(alice), 0);
        assertEq(round.totalEntries(), 1);
        assertGt(round.roundStartTime(), 0);
        assertEq(round.roundEndTime(), round.roundStartTime() + 24 hours);
        assertEq(round.prizePool(), (ENTRY_FEE * 60) / 100);
        assertEq(round.donationPool(), (ENTRY_FEE * 40) / 100);
        assertEq(cUSD.balanceOf(address(round)), ENTRY_FEE);
    }

    function test_EnterRound_SecondPlayerJoins() public {
        vm.prank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(alice);
        round.enterRound();

        vm.startPrank(bob);
        cUSD.approve(address(round), ENTRY_FEE);
        round.enterRound();
        vm.stopPrank();

        assertTrue(round.hasEntered(bob));
        assertEq(round.totalEntries(), 2);
        assertEq(round.prizePool(), 2 * ((ENTRY_FEE * 60) / 100));
        assertEq(round.donationPool(), 2 * ((ENTRY_FEE * 40) / 100));
        assertEq(cUSD.balanceOf(address(round)), 2 * ENTRY_FEE);
    }

    function test_Tap_NoLimitNoCooldown() public {
        vm.startPrank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        round.enterRound();

        // Many taps in same block - no cooldown, no rate limit
        for (uint256 i = 0; i < 10; i++) {
            round.tap();
        }
        vm.stopPrank();

        assertEq(round.taps(alice), 10);
    }

    function test_Tap_RevertsWhenNotEntered() public {
        vm.prank(alice);
        vm.expectRevert("Not entered");
        round.tap();
    }

    function test_Tap_RevertsWhenRoundEnded() public {
        vm.startPrank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        round.enterRound();
        vm.stopPrank();

        vm.warp(round.roundEndTime() + 1);
        vm.prank(alice);
        vm.expectRevert("Round ended");
        round.tap();
    }

    function test_SettleRound_DistributesPrizesAndDonation() public {
        vm.prank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(alice);
        round.enterRound();

        vm.prank(bob);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(bob);
        round.enterRound();

        vm.prank(carol);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(carol);
        round.enterRound();

        // Alice: 5 taps, Bob: 3, Carol: 1
        vm.prank(alice);
        for (uint256 i = 0; i < 5; i++) round.tap();
        vm.prank(bob);
        for (uint256 i = 0; i < 3; i++) round.tap();
        vm.prank(carol);
        round.tap();

        uint256 prizePool = round.prizePool();
        uint256 donationPool = round.donationPool();
        uint256 aliceBefore = cUSD.balanceOf(alice);
        uint256 bobBefore = cUSD.balanceOf(bob);
        uint256 carolBefore = cUSD.balanceOf(carol);
        uint256 charityBefore = cUSD.balanceOf(charityWallet);

        vm.warp(round.roundEndTime() + 1);
        round.settleRound();

        // 50% first, 30% second, 20% third
        uint256 firstPrize = (prizePool * 50) / 100;
        uint256 secondPrize = (prizePool * 30) / 100;
        uint256 thirdPrize = (prizePool * 20) / 100;

        assertEq(cUSD.balanceOf(alice), aliceBefore + firstPrize);
        assertEq(cUSD.balanceOf(bob), bobBefore + secondPrize);
        assertEq(cUSD.balanceOf(carol), carolBefore + thirdPrize);
        assertEq(cUSD.balanceOf(charityWallet), charityBefore + donationPool);
        assertTrue(round.roundSettled());
    }

    function test_SettleRound_SinglePlayerGetsFullPrize() public {
        vm.startPrank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        round.enterRound();
        round.tap();
        vm.stopPrank();

        uint256 prizePool = round.prizePool();
        uint256 donationPool = round.donationPool();
        uint256 aliceBefore = cUSD.balanceOf(alice);
        uint256 charityBefore = cUSD.balanceOf(charityWallet);

        vm.warp(round.roundEndTime() + 1);
        round.settleRound();

        assertEq(cUSD.balanceOf(alice), aliceBefore + prizePool);
        assertEq(cUSD.balanceOf(charityWallet), charityBefore + donationPool);
    }

    function test_SettleRound_RevertsBeforeRoundEnd() public {
        vm.prank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(alice);
        round.enterRound();

        vm.expectRevert("Round not ended");
        round.settleRound();
    }

    function test_GetRoundInfo() public {
        vm.prank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(alice);
        round.enterRound();

        (
            uint256 startTime,
            uint256 endTime,
            uint256 _prizePool,
            uint256 _donationPool,
            uint256 totalEntries,
            bool isActive,
            bool isSettled
        ) = round.getRoundInfo();

        assertEq(startTime, round.roundStartTime());
        assertEq(endTime, round.roundEndTime());
        assertEq(_prizePool, round.prizePool());
        assertEq(_donationPool, round.donationPool());
        assertEq(totalEntries, 1);
        assertTrue(isActive);
        assertFalse(isSettled);
    }

    function test_GetTopPlayers() public {
        vm.prank(alice);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(alice);
        round.enterRound();
        vm.prank(bob);
        cUSD.approve(address(round), ENTRY_FEE);
        vm.prank(bob);
        round.enterRound();

        vm.prank(alice);
        for (uint256 i = 0; i < 7; i++) round.tap();
        vm.prank(bob);
        for (uint256 i = 0; i < 3; i++) round.tap();

        (address[] memory addresses, uint256[] memory tapCounts) = round.getTopPlayers(3);
        assertEq(addresses.length, 3);
        assertEq(tapCounts.length, 3);
        assertEq(addresses[0], alice);
        assertEq(tapCounts[0], 7);
        assertEq(addresses[1], bob);
        assertEq(tapCounts[1], 3);
    }
}
