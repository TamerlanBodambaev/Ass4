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
          const contractABI = [...];  // Замените на ABI вашего контракта
          const contractAddress = '0x...';  // Замените на адрес вашего контракта

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
