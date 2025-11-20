import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { VotingApp } from "../target/types/voting_app";
import { assert } from "chai";

describe("voting_app", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.VotingApp as Program<VotingApp>;
  const provider = anchor.getProvider() as AnchorProvider;

  it("Initializes a ballot", async () => {
    const ballot = anchor.web3.Keypair.generate();

    const title = "My First Vote";
    const options = ["Option A", "Option B", "Option C"];

    await program.methods
      .initializeBallot(title, options)
      .accounts({
        ballot: ballot.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([ballot])
      .rpc();

    const ballotAccount = await program.account.ballot.fetch(ballot.publicKey);

    console.log("Ballot:", ballotAccount);

    assert.strictEqual(ballotAccount.title, title, "Title mismatch");
    assert.strictEqual(ballotAccount.options.length, 3, "Options mismatch");
  });

  it("Casts a vote", async () => {
    const ballot = anchor.web3.Keypair.generate();

    const title = "Favorite Language?";
    const options = ["Rust", "TypeScript"];

    // initialize ballot
    await program.methods
      .initializeBallot(title, options)
      .accounts({
        ballot: ballot.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([ballot])
      .rpc();

    // cast vote for option index 0 (Rust)
    await program.methods
      .vote(0)
      .accounts({
        ballot: ballot.publicKey,
        voter: provider.wallet.publicKey,
      })
      .rpc();

    const ballotAccount = await program.account.ballot.fetch(ballot.publicKey);

    console.log("Votes:", ballotAccount.votes);

    // votes[0] is a BN (BigNumber), so convert to number for comparison
    assert.strictEqual(ballotAccount.votes[0].toNumber(), 1, "Vote did not register!");
  });
});