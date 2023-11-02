import React, { useState, useEffect } from 'react';

function App() {
  const [betAmount, setBetAmount] = useState('');
  const [result, setResult] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function setupWeb3() {
      // Проверяем, установлен ли MetaMask
      if (window.ethereum) {
        try {
          // Запрашиваем доступ к учетной записи
          await window.ethereum.enable();
          const Web3 = require('web3');
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Определите ABI и адрес вашего контракта здесь
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

			];  // Замените на ABI вашего контракта
          const contractAddress = '0x1f253ECeaF2EBA2f353B4116C84CC48E28fF355f';  // Замените на адрес вашего контракта

          // Инициализируем экземпляр контракта
          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error('MetaMask не найден. Установите его или используйте совместимый браузер.');
      }
    }

    setupWeb3();
  }, []);

  const placeBet = async () => {
    if (!web3 || !contract) {
      console.error('Web3 или контракт не инициализированы');
      return;
    }

    const betAmountWei = web3.utils.toWei(betAmount, 'ether');

    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.placeBet().send({
        from: accounts[0],
        value: betAmountWei,
      });
      setResult('Ставка успешно размещена!');
    } catch (error) {
      console.error(error);
      setResult('Ошибка при размещении ставки.');
    }
  };

  return (
    <div className="App" style={{ background: 'black', color: 'white' }}>
      <h1>Интерфейс для ставок</h1>
      <label htmlFor="betAmount">Сумма ставки (в Ether):</label>
      <input
        type="number"
        id="betAmount"
        placeholder="Введите сумму"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
      />
      <button onClick={placeBet}>Сделать ставку</button>
      <div>{result}</div>
    </div>
  );
}

export default App;
