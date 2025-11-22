import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
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
    if (!wallet.publicKey) {
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
      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program(idl, PROGRAM_ID, provider);

      const ballot = web3.Keypair.generate();

      await program.methods
        .initializeBallot(title, options)
        .accounts({
          ballot: ballot.publicKey,
          authority: wallet.publicKey,
        })
        .signers([ballot])
        .rpc();

      setStatus(`✅ Ballot created successfully! Address: ${ballot.publicKey.toString()}`);
      setTitle('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Error creating ballot:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ballot">
      <h2>Create New Ballot</h2>
      
      <div className="form-group">
        <label>Ballot Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What's your favorite color?"
          maxLength={128}
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
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(index)} className="remove-btn">
                ✕
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button onClick={addOption} className="add-btn">
            + Add Option
          </button>
        )}
      </div>

      <button 
        onClick={createBallot} 
        disabled={loading || !wallet.publicKey}
        className="create-btn"
      >
        {loading ? 'Creating...' : 'Create Ballot'}
      </button>

      {status && <div className="status-message">{status}</div>}
    </div>
  );
}

export default CreateBallot;