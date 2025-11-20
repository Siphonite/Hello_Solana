import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingApp } from "../target/types/voting_app";

describe("voting_app", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.VotingApp as Program<VotingApp>;

  it("Initializes a ballot", async () => {
    const ballot = anchor.web3.Keypair.generate();

    const title = "My First Vote";
    const options = ["Option A", "Option B", "Option C"];

    await program.methods
      .initializeBallot(title, options)
      .accounts({
        ballot: ballot.publicKey,
        authority: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([ballot])
      .rpc();

    const ballotAccount = await program.account.ballot.fetch(ballot.publicKey);

    console.log("Ballot:", ballotAccount);

    if (ballotAccount.title !== title) throw new Error("Title mismatch");
    if (ballotAccount.options.length !== 3) throw new Error("Options mismatch");
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
        authority: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([ballot])
      .rpc();

    // cast vote for option index 0 (Rust)
    await program.methods
      .vote(0)
      .accounts({
        ballot: ballot.publicKey,
        voter: program.provider.publicKey,
      })
      .rpc();

    const ballotAccount = await program.account.ballot.fetch(ballot.publicKey);

    console.log("Votes:", ballotAccount.votes);

    if (ballotAccount.votes[0] !== 1) throw new Error("Vote did not register!");
  });
});
