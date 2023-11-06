document.addEventListener('DOMContentLoaded', async () => {
  // Connect to the Ethereum network using web3.js or ethers.js
  if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
  } else {
      console.error('Web3 provider not found');
  }

  // Load the staking contract address and ABI
  const contractAddress = '0x1f253ECeaF2EBA2f353B4116C84CC48E28fF355f';
  const contractABI = [ 

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

]; // Сюда надо добавить Contract
  const stakingContract = new web3.eth.Contract(contractABI, contractAddress);

  // Update user balances
  const updateBalances = async () => {
      const stakedBalance = await stakingContract.methods.userBalances(web3.eth.defaultAccount).call();
      const rewardsBalance = await stakingContract.methods.calculateRewards(web3.eth.defaultAccount).call();
      document.getElementById('stakedBalance').textContent = `Staked Balance: ${stakedBalance} tokens`;
      document.getElementById('rewardsBalance').textContent = `Rewards Balance: ${rewardsBalance} tokens`;
  };

  // Function to stake tokens
  const stakeTokens = async () => {
      const stakeAmount = document.getElementById('stakeAmount').value;
      if (stakeAmount <= 0) {
          alert('Please enter a valid stake amount.');
          return;
      }

      await stakingContract.methods.stakeTokens(stakeAmount).send({ from: web3.eth.defaultAccount });
      updateBalances();
  };

  // Function to withdraw tokens and rewards
  const withdrawTokens = async () => {
      await stakingContract.methods.withdrawTokens().send({ from: web3.eth.defaultAccount });
      updateBalances();
  };

  // Ensure the user is connected to an Ethereum wallet
  if (web3.eth.defaultAccount) {
      updateBalances();
  } else {
      alert('Please connect to an Ethereum wallet (e.g., MetaMask).');
  }
});
