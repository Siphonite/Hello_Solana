import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import idl from '../idl/voting_app.json';

const PROGRAM_ID = new web3.PublicKey('nWQ6uXRz9VRLbHwWD2WyaHULWgMrWGLSFi4TuEC3qmX');

function VoteBallot() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [ballotAddress, setBallotAddress] = useState('');
  const [ballotData, setBallotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [status, setStatus] = useState('');

  const fetchBallot = async () => {
    if (!ballotAddress.trim()) {
      setStatus('Please enter a ballot address!');
      return;
    }

    setLoading(true);
    setStatus('Fetching ballot...');

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(idl, PROGRAM_ID, provider);

      const ballotPubkey = new web3.PublicKey(ballotAddress);
      const ballot = await program.account.ballot.fetch(ballotPubkey);

      setBallotData({
        address: ballotAddress,
        title: ballot.title,
        options: ballot.options,
        votes: ballot.votes.map(v => v.toNumber()),
        voters: ballot.voters,
      });
      setStatus('');
    } catch (error) {
      console.error('Error fetching ballot:', error);
      setStatus(`❌ Error: ${error.message}`);
      setBallotData(null);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (optionIndex) => {
    if (!wallet.publicKey) {
      setStatus('Please connect your wallet first!');
      return;
    }

    setVoting(true);
    setStatus('Casting vote...');

    try {
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(idl, PROGRAM_ID, provider);

      const ballotPubkey = new web3.PublicKey(ballotAddress);

      await program.methods
        .vote(optionIndex)
        .accounts({
          ballot: ballotPubkey,
          voter: wallet.publicKey,
        })
        .rpc();

      setStatus('✅ Vote cast successfully!');
      
      // Refresh ballot data
      setTimeout(() => fetchBallot(), 2000);
    } catch (error) {
      console.error('Error casting vote:', error);
      if (error.message.includes('AlreadyVoted')) {
        setStatus('❌ You have already voted on this ballot!');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = ballotData?.votes.reduce((sum, v) => sum + v, 0) || 0;

  return (
    <div className="vote-ballot">
      <h2>Vote on Ballot</h2>
      
      <div className="form-group">
        <label>Ballot Address:</label>
        <input
          type="text"
          value={ballotAddress}
          onChange={(e) => setBallotAddress(e.target.value)}
          placeholder="Enter ballot public key"
        />
        <button onClick={fetchBallot} disabled={loading} className="fetch-btn">
          {loading ? 'Loading...' : 'Load Ballot'}
        </button>
      </div>

      {status && <div className="status-message">{status}</div>}

      {ballotData && (
        <div className="ballot-details">
          <h3>{ballotData.title}</h3>
          <p className="total-votes">Total Votes: {totalVotes}</p>
          
          <div className="options-list">
            {ballotData.options.map((option, index) => {
              const votes = ballotData.votes[index];
              const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
              
              return (
                <div key={index} className="option-card">
                  <div className="option-header">
                    <span className="option-name">{option}</span>
                    <span className="vote-count">{votes} votes ({percentage}%)</span>
                  </div>
                  <div className="vote-bar">
                    <div 
                      className="vote-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => castVote(index)}
                    disabled={voting || !wallet.publicKey}
                    className="vote-btn"
                  >
                    Vote
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default VoteBallot;