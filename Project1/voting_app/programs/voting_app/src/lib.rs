use anchor_lang::prelude::*;

declare_id!("nWQ6uXRz9VRLbHwWD2WyaHULWgMrWGLSFi4TuEC3qmX");

const MAX_OPTIONS: usize = 10;   
const MAX_OPTION_LEN: usize = 32;  
const MAX_TITLE_LEN: usize = 128;  

// fill later

const BALLOT_SPACE: usize = 8+ 32+ 4 + MAX_TITLE_LEN + 4+ (MAX_OPTIONS * MAX_OPTION_LEN) + 4 + (MAX_OPTIONS * 8) + 4 + (100*32); 

#[program]
pub mod voting_app {
    use super::*;

    pub fn initialize_ballot(
        ctx: Context<InitializeBallot>,
        title: String,
        options: Vec<String>,
    ) -> Result<()> {
        let ballot = &mut ctx.accounts.ballot;
        
        require!(options.len()> 0 && options.len() <= MAX_OPTIONS, 
            VotingError::InvalidOptions); 

        require!(title.len() <= MAX_TITLE_LEN, VotingError::TitleTooLong); 

        // basic validation for optional lengths

        for opt in &options {
            require!(opt.len() <= MAX_OPTION_LEN, VotingError::OptionTooLong);
        } 

        ballot.owner = *ctx.accounts.authority.key;
        ballot.title = title;
        ballot.options = options;
        ballot.votes = vec![0u64; options.len()];
        ballot.voters = vec![]; // tracks who voted.
        Ok(())
    } 

    pub fn vote (ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let ballot = &mut ctx.accounts.ballot;
        let voter = ctx.accounts.voter.key; 

        // ensure option exists 
         
        let idx = option_index as usize;
        require!(idx < ballot.options.len(), VotingError::InvalidOptionIndex);

        // ensure that not already voted 

        for p in ballot.voters.iter(){
            require!(p !=voter, VotingError::AlreadyVoted);
        }

        ballot.votes[idx] ballot.votes[idx].checked_add(1).ok_or(VotingError::VoteOverflow)?;
        ballot.voters.push(*voter); // add voter to the list
        Ok(())
    }   
} 

#[derive(Accounts)]
pub struct InitializeBallot<'info> {
    #[account(init, payer = authority, space = BALLOT_SPACE)]
    pub ballot: Account<'info, Ballot>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub ballot: Account<'info, Ballot>,
    // CHECK: voter just signs, we store their pubkey in the account. 
    pub voter: Signer<'info>,
}

#[account]
pub struct Ballot {
    pub owner: Pubkey, // who created the ballot
    pub title: String, // title of the ballot
    pub options: Vec<String>, // options to vote on
    pub votes: Vec<u64>, // votes for each option
    pub voters: Vec<Pubkey>, // list of voters who have voted
}

#[error_code]
pub enum VotingError {
    #[msg("Too many options or none provided")]
    InvalidOptions,
    #[msg("Option string too long")]
    OptionTooLong,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Invalid option index")]
    InvalidOptionIndex,
    #[msg("This wallet already voted")]
    AlreadyVoted,
    #[msg("Overflow occurred")]
    Overflow,
}