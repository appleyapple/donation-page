import React, { useState } from 'react';
import { ethers } from 'ethers';
import Donate from './artifacts/contracts/Donate.sol/Donate.json';
import './App.css';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

function App() {

  // contract 
  const [contractRead, setContractRead] = useState(null);
  const [contractWrite, setContractWrite] = useState(null);

  // ui
  const [walletAddress, setWalletAddress] = useState('');
  const [connectButton, setConnectButton] = useState('Connect wallet');
  const [donationLimit, setDonationLimit] = useState(null);
  const [donationReceiver, setDonationReceiver] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // form
  const [donationAmount, setDonationAmount] = useState(0);

  // connect to browser extension 'MetaMask' and ethers
  async function connectWallet() {
    // if metamask not detected, set error msg
    if (typeof window.ethereum == 'undefined') {
      setErrorMessage('Error: install metamask!')
    } else {
      // connect wallet 
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(result => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); 
        setContractRead(new ethers.Contract(contractAddress, Donate.abi, provider));
        setContractWrite(new ethers.Contract(contractAddress, Donate.abi, signer));
        return result[0];
      })
      // display connection
      .then(result => {
        setConnectButton('Wallet connected');
        setWalletAddress(result);
      });
    }
  }

  // make donation (input in WEI)
  async function donate() {
    if (typeof window.ethereum !== 'undefined') {
      const options = {value: ethers.utils.parseEther(ethers.utils.formatEther(donationAmount))}
      const reciept = await contractWrite.donate(options);
      await reciept.wait();
      console.log('Donation success');
    }
  }

  async function setLimit() {
    
  }

  async function setReceiver() {
    
  }

  // get storage data: donation limit, patrons-donations, receiver
  async function getContractData() {
    if (typeof window.ethereum !== 'undefined') { // look for metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, Donate.abi, provider);
      try {
        let limit = await contract.donationLimit();
        setDonationLimit(ethers.utils.formatEther(limit)) // bignumber -> eth

        let receiver = await contract.getReceiverAddress();
        setDonationReceiver(ethers.utils.getAddress(receiver));

        // need to test (convert array elements to readable addresses)
        let patrons = await contract.getPatronsArray();
        console.log(patrons);
      } catch (err) {
        console.log('error: ', err);
      }
    }
  }

  React.useEffect(() => {
    getContractData()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h2>Contract Address: {contractAddress}</h2>
        <h2>Connected Wallet: {walletAddress}</h2>
        <h4>Donate to: {donationReceiver}</h4>
        <h4>Donation Limit: {donationLimit} ETH</h4>

        <button onClick={connectWallet}>{connectButton}</button>
        <input
          onChange={e => setDonationAmount(e.target.value)}
          placeholder='Donation limit'
          value={donationAmount}></input>
        <button onClick={donate}>Donate</button>
        <br/><br/>
        <input onChange={e => setDonationLimit(e.target.value)} placeholder='Donation limit'/>
        <button onClick={setLimit}>[Owner only] Set donation limit</button>

        <input onChange={e => setDonationReceiver(e.target.value)} placeholder='Receiver address'/>
        <button onClick={setReceiver}>[Owner only] Designate donation receiver</button>

        <h2>{errorMessage}</h2>

      </header>
    </div>
  );
}

export default App;
