use anchor_lang::prelude::*;

declare_id!("nWQ6uXRz9VRLbHwWD2WyaHULWgMrWGLSFi4TuEC3qmX");

#[program]
pub mod voting_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
