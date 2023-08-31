use anchor_lang::prelude::*;
use anchor_lang::system_program::ID as system_program_id;
use anchor_spl::token::{self};

declare_id!("6QVdsMKyqw1peU6TRHTskzFH6ivRzXe22bfEoHKpiP73");

#[program]
pub mod dispenser {
    use super::*;

    pub fn create_dispenser(
        ctx: Context<CreateDispenser>,
        _dispenser_pda: Pubkey,
        _bump: u8,
    ) -> Result<()> {
        let dispenser_account: &mut DispenserAccount = &mut ctx.accounts.dispenser_account;
        dispenser_account.is_initialized = true;
        // ... set other fields as needed ...

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(seed: String, bump: u8)]
pub struct CreateDispenser<'info> {
    #[account(
        seeds = [seed.as_bytes()],
        bump, init, payer = user, space = 8 + 40,
        owner = ID
    )]
    pub dispenser_account: Account<'info, DispenserAccount>,

    #[account(mut, signer)]
    /// CHECK: The user is the transaction signer and so it's safe to perform operations on.
    pub user: AccountInfo<'info>,

    #[account(address = system_program_id)]
    /// CHECK: The system program is required to create the account.
    pub system_program: AccountInfo<'info>,

    /// CHECK: The SPL token program is required to create the account.
    #[account(address = token::ID)]
    pub token_program: AccountInfo<'info>,
}

#[account]
pub struct DispenserAccount {
    pub is_initialized: bool,
    // ... other fields ...
}
