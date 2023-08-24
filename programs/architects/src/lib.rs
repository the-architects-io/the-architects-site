use anchor_lang::prelude::*;

declare_id!("3mE2UAhuJxCbcHBCM4gFeWkJheDFw2q9iDykf3S9RDwx");

#[program]
pub mod architects {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
