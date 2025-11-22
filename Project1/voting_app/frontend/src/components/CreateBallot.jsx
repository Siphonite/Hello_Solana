import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import idl from '../idl/voting_app.json';

const PROGRAM_ID = new web3.PublicKey('nWQ6uXRz9VRLbHwWD2WyaHULWgMrWGLSFi4TuEC3qmX');

function CreateBallot() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createBallot = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus('Please connect your wallet first!');
      return;
    }

    if (!title.trim() || options.some(opt => !opt.trim())) {
      setStatus('Please fill in all fields!');
      return;
    }

    setLoading(true);
    setStatus('Creating ballot...');

    try {
      // Create provider with proper wallet adapter
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );

      const program = new Program(idl, PROGRAM_ID, provider);

      const ballot = web3.Keypair.generate();

      const tx = await program.methods
        .initializeBallot(title, options)
        .accounts({
          ballot: ballot.publicKey,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([ballot])
        .rpc();

      setStatus(`Ballot created successfully! 
      
Ballot Address: ${ballot.publicKey.toString()}
Transaction: ${tx}

Save this ballot address to vote on it later!`);
      
      setTitle('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Error creating ballot:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ballot">
      <h2>Create New Ballot</h2>

      {!wallet.connected && (
        <div className="warning-message">
           Please connect your wallet using the button in the header to create a ballot.
        </div>
      )}
      
      <div className="form-group">
        <label>Ballot Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What's your favorite color?"
          maxLength={128}
          disabled={!wallet.connected}
        />
      </div>

      <div className="form-group">
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index} className="option-input">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={32}
              disabled={!wallet.connected}
            />
            {options.length > 2 && (
              <button 
                onClick={() => removeOption(index)} 
                className="remove-btn"
                disabled={!wallet.connected}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button 
            onClick={addOption} 
            className="add-btn"
            disabled={!wallet.connected}
          >
            + Add Option
          </button>
        )}
      </div>

      <button 
        onClick={createBallot} 
        disabled={loading || !wallet.connected}
        className="create-btn"
      >
        {loading ? 'Creating...' : 'Create Ballot'}
      </button>

      {status && <div className="status-message">{status}</div>}
    </div>
  );
}

export default CreateBallot;