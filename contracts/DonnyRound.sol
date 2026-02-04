// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DonnyRound
 * @dev Tap-to-earn game contract with charity donations on CELO
 * Entry fee: 2 cUSD
 * Split: 60% prize pool, 40% charity
 * Rate limit: 600 taps/min per wallet, 100ms cooldown
 */
contract DonnyRound is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant ENTRY_FEE = 2 * 1e18; // 2 cUSD
    uint256 public constant PRIZE_POOL_PERCENTAGE = 60; // 60% to prize pool
    uint256 public constant CHARITY_PERCENTAGE = 40; // 40% to charity
    uint256 public constant ROUND_DURATION = 24 hours;
    uint256 public constant MAX_TAPS_PER_MINUTE = 600;
    uint256 public constant MIN_TAP_COOLDOWN = 100; // 100ms in seconds (will use block.timestamp)
    uint256 public constant FIRST_PLACE_PERCENTAGE = 50;
    uint256 public constant SECOND_PLACE_PERCENTAGE = 30;
    uint256 public constant THIRD_PLACE_PERCENTAGE = 20;

    // State variables
    IERC20 public immutable cUSD;
    address public immutable charityWallet;
    
    uint256 public roundStartTime;
    uint256 public roundEndTime;
    bool public roundSettled;
    
    uint256 public totalEntries;
    uint256 public prizePool; // 60% of entries
    uint256 public donationPool; // 40% of entries
    
    // Participant tracking
    mapping(address => bool) public hasEntered;
    mapping(address => uint256) public taps;
    mapping(address => uint256) public lastTapTimestamp;
    mapping(address => uint256) public tapsInCurrentMinute;
    mapping(address => uint256) public currentMinuteForWallet;
    
    address[] public participants;
    
    // Events
    event RoundStarted(uint256 startTime, uint256 endTime);
    event PlayerEntered(address indexed player, uint256 entryFee);
    event PlayerTapped(address indexed player, uint256 totalTaps);
    event RoundSettled(
        address indexed firstPlace,
        address indexed secondPlace,
        address indexed thirdPlace,
        uint256 firstPrize,
        uint256 secondPrize,
        uint256 thirdPrize,
        uint256 donationAmount
    );

    constructor(address _cUSD, address _charityWallet) Ownable(msg.sender) {
        require(_cUSD != address(0), "Invalid cUSD address");
        require(_charityWallet != address(0), "Invalid charity address");
        cUSD = IERC20(_cUSD);
        charityWallet = _charityWallet;
    }

    /**
     * @dev Enter the round by paying entry fee
     * First player to enter starts the round
     */
    function enterRound() external nonReentrant {
        require(!hasEntered[msg.sender], "Already entered");
        require(block.timestamp < roundEndTime || roundStartTime == 0, "Round ended");
        
        // Transfer entry fee from player
        cUSD.safeTransferFrom(msg.sender, address(this), ENTRY_FEE);
        
        // If first player, start the round
        if (roundStartTime == 0) {
            roundStartTime = block.timestamp;
            roundEndTime = roundStartTime + ROUND_DURATION;
            emit RoundStarted(roundStartTime, roundEndTime);
        }
        
        // Update pools
        uint256 prizeAmount = (ENTRY_FEE * PRIZE_POOL_PERCENTAGE) / 100;
        uint256 donationAmount = (ENTRY_FEE * CHARITY_PERCENTAGE) / 100;
        
        prizePool += prizeAmount;
        donationPool += donationAmount;
        
        // Mark as entered
        hasEntered[msg.sender] = true;
        participants.push(msg.sender);
        totalEntries++;
        
        emit PlayerEntered(msg.sender, ENTRY_FEE);
    }

    /**
     * @dev Tap to increment tap count
     * Rate limit: 600 taps/min, 100ms cooldown
     */
    function tap() external nonReentrant {
        require(hasEntered[msg.sender], "Not entered");
        require(block.timestamp < roundEndTime, "Round ended");
        require(!roundSettled, "Round settled");
        
        // Calculate current minute (using block.timestamp / 60)
        uint256 currentMinute = block.timestamp / 60;
        
        // Reset counter if new minute
        if (currentMinuteForWallet[msg.sender] != currentMinute) {
            tapsInCurrentMinute[msg.sender] = 0;
            currentMinuteForWallet[msg.sender] = currentMinute;
        }
        
        // Check rate limit (600 taps/min)
        require(tapsInCurrentMinute[msg.sender] < MAX_TAPS_PER_MINUTE, "Rate limit exceeded");
        
        // Check cooldown (1 second minimum between taps)
        // Note: block.timestamp has 1 second precision, so we use 1 second cooldown
        // For true 100ms cooldown, we'd need off-chain rate limiting or a different approach
        require(
            block.timestamp >= lastTapTimestamp[msg.sender] + 1,
            "Cooldown active"
        );
        
        // Increment taps
        taps[msg.sender]++;
        tapsInCurrentMinute[msg.sender]++;
        lastTapTimestamp[msg.sender] = block.timestamp;
        
        emit PlayerTapped(msg.sender, taps[msg.sender]);
    }

    /**
     * @dev Settle the round: determine winners and distribute prizes
     * Can be called by anyone after round ends
     */
    function settleRound() external nonReentrant {
        require(block.timestamp >= roundEndTime, "Round not ended");
        require(!roundSettled, "Already settled");
        require(totalEntries > 0, "No participants");
        
        roundSettled = true;
        
        // Find top 3 players
        address firstPlace = address(0);
        address secondPlace = address(0);
        address thirdPlace = address(0);
        uint256 firstTaps = 0;
        uint256 secondTaps = 0;
        uint256 thirdTaps = 0;
        
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 participantTaps = taps[participant];
            
            if (participantTaps > firstTaps) {
                thirdPlace = secondPlace;
                thirdTaps = secondTaps;
                secondPlace = firstPlace;
                secondTaps = firstTaps;
                firstPlace = participant;
                firstTaps = participantTaps;
            } else if (participantTaps > secondTaps) {
                thirdPlace = secondPlace;
                thirdTaps = secondTaps;
                secondPlace = participant;
                secondTaps = participantTaps;
            } else if (participantTaps > thirdTaps) {
                thirdPlace = participant;
                thirdTaps = participantTaps;
            }
        }
        
        // Calculate prizes
        uint256 firstPrize = 0;
        uint256 secondPrize = 0;
        uint256 thirdPrize = 0;
        
        if (totalEntries == 1) {
            // Only 1 player: gets 100% of prize pool
            firstPrize = prizePool;
        } else if (totalEntries == 2) {
            // 2 players: 70% and 30%
            firstPrize = (prizePool * 70) / 100;
            secondPrize = prizePool - firstPrize;
        } else {
            // 3+ players: 50%, 30%, 20%
            firstPrize = (prizePool * FIRST_PLACE_PERCENTAGE) / 100;
            secondPrize = (prizePool * SECOND_PLACE_PERCENTAGE) / 100;
            thirdPrize = (prizePool * THIRD_PLACE_PERCENTAGE) / 100;
        }
        
        // Distribute prizes
        if (firstPlace != address(0) && firstPrize > 0) {
            cUSD.safeTransfer(firstPlace, firstPrize);
        }
        if (secondPlace != address(0) && secondPrize > 0) {
            cUSD.safeTransfer(secondPlace, secondPrize);
        }
        if (thirdPlace != address(0) && thirdPrize > 0) {
            cUSD.safeTransfer(thirdPlace, thirdPrize);
        }
        
        // Send donation to charity
        if (donationPool > 0) {
            cUSD.safeTransfer(charityWallet, donationPool);
        }
        
        emit RoundSettled(
            firstPlace,
            secondPlace,
            thirdPlace,
            firstPrize,
            secondPrize,
            thirdPrize,
            donationPool
        );
    }

    /**
     * @dev Get round information
     */
    function getRoundInfo() external view returns (
        uint256 _roundStartTime,
        uint256 _roundEndTime,
        uint256 _prizePool,
        uint256 _donationPool,
        uint256 _totalEntries,
        bool _isActive,
        bool _isSettled
    ) {
        _roundStartTime = roundStartTime;
        _roundEndTime = roundEndTime;
        _prizePool = prizePool;
        _donationPool = donationPool;
        _totalEntries = totalEntries;
        _isActive = block.timestamp >= roundStartTime && block.timestamp < roundEndTime && roundStartTime > 0;
        _isSettled = roundSettled;
    }

    /**
     * @dev Get user taps
     */
    function getUserTaps(address user) external view returns (uint256) {
        return taps[user];
    }

    /**
     * @dev Get top N players (for leaderboard)
     * Note: This is a view function but may be gas-intensive for many participants
     * For MVP, we'll limit to top 10
     */
    function getTopPlayers(uint256 topN) external view returns (
        address[] memory addresses,
        uint256[] memory tapCounts
    ) {
        require(topN <= 10, "Max 10 players");
        
        // Create arrays
        address[] memory topAddresses = new address[](topN);
        uint256[] memory topTaps = new uint256[](topN);
        
        // Initialize with zeros
        for (uint256 i = 0; i < topN; i++) {
            topAddresses[i] = address(0);
            topTaps[i] = 0;
        }
        
        // Find top N
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 participantTaps = taps[participant];
            
            // Insert in sorted order
            for (uint256 j = 0; j < topN; j++) {
                if (participantTaps > topTaps[j]) {
                    // Shift down
                    for (uint256 k = topN - 1; k > j; k--) {
                        topAddresses[k] = topAddresses[k - 1];
                        topTaps[k] = topTaps[k - 1];
                    }
                    // Insert
                    topAddresses[j] = participant;
                    topTaps[j] = participantTaps;
                    break;
                }
            }
        }
        
        return (topAddresses, topTaps);
    }

    /**
     * @dev Get all participants (for leaderboard)
     */
    function getAllParticipants() external view returns (address[] memory) {
        return participants;
    }
}

