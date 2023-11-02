pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

contract Staking {
    address public owner;
    uint public stakingPeriod;
    uint public totalRewards;
    address[] public users; // Maintain a list of users

    mapping(address => uint) public userBalances;
    mapping(address => uint) public stakedBalances;
    mapping(address => uint) public stakingStartTimes;

    constructor(uint _stakingPeriod, uint _totalRewards) {
        owner = msg.sender;
        stakingPeriod = _stakingPeriod;
        totalRewards = _totalRewards;
    }

    function stake(uint _amount) public {
        require(_amount > 0, "Amount should be greater than 0");
        require(userBalances[msg.sender] >= _amount, "Insufficient balance");

        userBalances[msg.sender] -= _amount;
        stakedBalances[msg.sender] += _amount;
        stakingStartTimes[msg.sender] = block.timestamp;

        // Add the user to the list if they're not already there
        if (stakedBalances[msg.sender] > 0) {
            users.push(msg.sender);
        }
    }

    function calculateRewards(address _user) public view returns (uint) {
        uint timeStaked = block.timestamp - stakingStartTimes[_user];
        uint stakedAmount = stakedBalances[_user];
        return (stakedAmount * timeStaked) / stakingPeriod;
    }

    function distributeRewards() public {
        require(msg.sender == owner, "Only owner can distribute rewards");

        for (uint i = 0; i < users.length; i++) {
            address user = users[i];
            uint rewards = calculateRewards(user);
            userBalances[user] += rewards;
        }
    }

    function withdraw() public {
        require(stakedBalances[msg.sender] > 0, "Nothing staked");
        
        uint rewards = calculateRewards(msg.sender);
        userBalances[msg.sender] += rewards;
        
        userBalances[msg.sender] += stakedBalances[msg.sender];
        stakedBalances[msg.sender] = 0;
    }
}
