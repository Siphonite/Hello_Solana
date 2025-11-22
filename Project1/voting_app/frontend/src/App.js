import React, { useState } from 'react';
import { WalletContextProvider } from './WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import CreateBallot from './components/CreateBallot';
import VoteBallot from './components/VoteBallot';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <WalletContextProvider>
      <div className="App">
        <header className="App-header">
          <h1>🗳️ Solana Voting App</h1>
          <WalletMultiButton />
        </header>

        <div className="tabs">
          <button 
            className={activeTab === 'create' ? 'active' : ''} 
            onClick={() => setActiveTab('create')}
          >
            Create Ballot
          </button>
          <button 
            className={activeTab === 'vote' ? 'active' : ''} 
            onClick={() => setActiveTab('vote')}
          >
            Vote
          </button>
        </div>

        <div className="content">
          {activeTab === 'create' && <CreateBallot />}
          {activeTab === 'vote' && <VoteBallot />}
        </div>
      </div>
    </WalletContextProvider>
  );
}

export default App;