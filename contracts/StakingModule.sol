// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract StakingModule is Ownable, ReentrancyGuard, Pausable {
    ///////////////////////ERRORS/////////////////////

    error InvalidAmount();
    error InvalidDuration();
    error InvalidApr();
    error StakeAmountLessThanOrEqualToZero();
    error AlreadyUnstaked();
    error StakingPeriodNotOver();
    error InvalidStakeIndex();
    error StakeExceedsLimit();
    error TotalStakeExceedsLimit();
    error ExceedingNumberOfStakes();

    ///////////////////////STATE VARIABLES/////////////////////

    IERC20 public token;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        bool withdrawn;
    }

    mapping(address stakeHolder => Stake[] stakes) public userStakes; // Users staking record
    uint256 public APRate; // Annual-Percentage-Rate
    uint256 public totalStakedAmount; // Total currently staked amount
    uint256 public userPerStakeLimit; // Max amount a user can stake per stake
    uint256 public totalStakeLimit; // Max that can be staked
    uint256 public maxNumStakesPerUser; // Max no of stakes for a user

    ///////////////////////EVENTS/////////////////////

    event Staked(address indexed userAddress, uint256 indexed amountStaked);
    event Unstake(address indexed userAddress, uint256 indexed amountUnstaked, uint256 reward);
    event DurationExtended(address indexed userAddress, uint256 indexed indexOfStake, uint256 duration);
    event TokensWithdrawn(address indexed ownerAddress, uint256 indexed amount);
    event TokensAdded(address indexed ownerAddress, uint256 indexed amount);
    event EmergencyStopDeactivated();
    event EmergencyStopActivated();

    ///////////////////////CONSTRUCTOR/////////////////////

    /**
     * @param _token token address
     * @param _apr reward rate in basis points 1% -> 100 bp
     * @param owner owner
     * @param _userStakeLimit max amount user can stake in one stake
     * @param _totalStakeLimit total stake amount limit for the contract
     * @param _maxNumStakesPerUser max stakes a user can take at a time
     */
    constructor(IERC20 _token, uint256 _apr, address owner, uint256 _userStakeLimit, 
    uint256 _totalStakeLimit, uint256 _maxNumStakesPerUser) Ownable(owner) {
        token = _token;
        APRate = _apr;
        userPerStakeLimit = _userStakeLimit;
        totalStakeLimit = _totalStakeLimit;
        maxNumStakesPerUser = _maxNumStakesPerUser;
    }

    ///////////////////////FUNCTIONS/////////////////////

    /**
     * @notice This function pause and resume staking for users
     * @dev Can only be called by owner
     */
    function pause() external onlyOwner {
        _pause();
        emit EmergencyStopActivated();
    }

    /**
     * @notice This function resumes staking for users
     * @dev Can only be called by owner
     */
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyStopDeactivated();
    }

    /**
     * @notice This function changes the APRate
     * @dev Can only be called by owner
     * @param newApr New APRate rate
     */
    function changeApr(uint256 newApr) external onlyOwner {
        if (newApr < 100) revert InvalidApr();

        APRate = newApr;
    }

    /**
     * @notice This function changes the userPerStakeLimit
     * @dev Can only be called by owner
     * @param _limit New userPerStakeLimit
     */
    function setUserStakeLimit(uint256 _limit) external onlyOwner {
        if (_limit <= 0) revert InvalidAmount();
        userPerStakeLimit = _limit;
    }

    /**
     * @notice This function changes the totalStakeLimit
     * @dev Can only be called by owner
     * @param _limit New totalStakeLimit
     */
    function setTotalStakeLimit(uint256 _limit) external onlyOwner {
        if (_limit <= 0) revert InvalidAmount();
        totalStakeLimit = _limit;
    }

    /**
     * @notice This function handles the staking of token
     * @param _amount Amount of tokens to be staked by user
     * @param _duration Duration for which the tokens are staked
     */
    function stake(uint256 _amount, uint256 _duration) external whenNotPaused{
        if (userStakes[msg.sender].length >= maxNumStakesPerUser) revert ExceedingNumberOfStakes();
        if (_amount <= 0) revert InvalidAmount();
        if (_duration <= 0) revert InvalidDuration();
        if (_amount > userPerStakeLimit) revert StakeExceedsLimit();
        if (totalStakedAmount + _amount > totalStakeLimit) revert TotalStakeExceedsLimit();


        Stake memory newStake = Stake({ amount: _amount, startTime: block.timestamp, 
        duration: _duration, withdrawn: false});

        totalStakedAmount += _amount;
        userStakes[msg.sender].push(newStake);

        token.transferFrom(msg.sender, address(this), _amount);
        emit Staked(msg.sender, _amount);
    }

    /**
     * @notice This function handles the unstaking of token
     * @param indexOfStake Index of the stake to be unstaked
     */
    function unstake(uint256 indexOfStake) external nonReentrant {
        if (indexOfStake >= userStakes[msg.sender].length) revert InvalidStakeIndex();

        Stake memory userStake = userStakes[msg.sender][indexOfStake];
        if (userStake.amount <= 0) revert StakeAmountLessThanOrEqualToZero();
        if (userStake.withdrawn) revert AlreadyUnstaked();
        if (block.timestamp < userStake.startTime + userStake.duration) revert StakingPeriodNotOver();

        uint256 reward = calculateReward(userStake.amount, userStake.duration);
        uint256 totalAmountToSend = userStake.amount + reward;

        uint256 amount = userStake.amount;
        totalStakedAmount -= amount;
        userStake.withdrawn = true;

        uint256 len = userStakes[msg.sender].length;
        userStakes[msg.sender][indexOfStake] = userStakes[msg.sender][len - 1];
        userStakes[msg.sender].pop();
        
        token.transfer(msg.sender, totalAmountToSend);
        emit Unstake(msg.sender, amount, reward);
    }

    /**
     * @notice This function allows the owner to withdraw tokens from the contract
     * @param amount Amount of tokens to withdraw
     */
    function ownerWithdrawTokens(uint256 amount) external onlyOwner {
        if (amount <= 0) revert InvalidAmount();

        token.transfer(msg.sender, amount);
        emit TokensWithdrawn(msg.sender, amount);
    }

    /**
     * @notice This function allows the owner to add tokens to the contract
     * @param amount Amount of tokens to add
     */
    function ownerAddTokens(uint256 amount) external onlyOwner {
        if (amount <= 0) revert InvalidAmount();

        token.transferFrom(msg.sender, address(this), amount);
        emit TokensAdded(msg.sender, amount);
    }

    /**
     * @notice This function retrieves a user's stake details
     * @param user Address of the user
     * @param indexOfStake Index of the stake to retrieve
     * @return Stake The details of the stake
     */
    function getUserStake(address user, uint256 indexOfStake) external view returns (Stake memory) {
        if (indexOfStake >= userStakes[msg.sender].length) revert InvalidStakeIndex();

        return userStakes[user][indexOfStake];
    }

    /**
     * @notice This function calculates the total rewards for a user
     * @param user Address of the user
     * @return Total total rewards for the user
     */
    function getTotalRewards(address user) external view returns (uint256) {
        uint256 totalRewards;
        Stake[] memory stakes = userStakes[user];

        for (uint256 i = 0; i < stakes.length; i++) {
            if (!stakes[i].withdrawn) {
                totalRewards += calculateReward(stakes[i].amount, stakes[i].duration);
            }
        }

        return totalRewards;
    }

    /**
     * @notice This function calculates the reward for a stake
     * @param _amount Amount of tokens staked
     * @param _duration Duration for which the tokens are staked
     * @return reward The calculated reward amount
     */ 
    function calculateReward(uint256 _amount, uint256 _duration) public view returns(uint256) {
        uint256 durationInYears = _duration * 1e18 / (365.25 days);
        uint256 reward = (_amount * APRate * durationInYears) / (10000 * 1e18);
        return reward;
    }
}
