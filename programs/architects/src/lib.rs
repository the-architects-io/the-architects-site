use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TransferChecked};
use solana_program::program_error::ProgramError;

declare_id!("GfopewW1WA2S4cqs4WaJ74JTWKQCDeBAvkiitAH1sssf");

#[program]
pub mod architects_token_dispenser {
    use super::*;

    const DISPENSER_AUTHORITY_SEED: &[u8] = b"dispenser_authority";

    pub fn initialize(ctx: Context<Initialize>, dispenser_seed: String) -> Result<()> {
        if dispenser_seed.as_bytes().len() > 200 {
            msg!("Dispenser seed is too long.");
            return Err(ProgramError::InvalidSeeds.into());
        }

        let seeds = &[
            &DISPENSER_AUTHORITY_SEED[..],
            &dispenser_seed.as_bytes()[..],
        ];
        let (dispenser_authority, _bump) = Pubkey::find_program_address(seeds, ctx.program_id);

        // Save the generated authority in the dispenser account state
        ctx.accounts.dispenser_account.dispenser_authority = dispenser_authority;

        Ok(())
    }

    pub fn dispense(ctx: Context<Dispense>, amount: u64, decimals: u8) -> Result<()> {
        // add the condition to check if amount in the dispenser is greater than or equal to the required amount
        if ctx.accounts.dispenser_account.amount < amount {
            msg!("Insufficient funds.");
            return Err(ProgramError::InsufficientFunds.into());
        }
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.dispenser_account.to_account_info().clone(),
            to: ctx.accounts.destination.clone(),
            authority: ctx.accounts.dispenser_authority.clone(),
            mint: ctx.accounts.mint.clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer_checked(cpi_ctx, amount, decimals)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32)]
    pub dispenser_account: Account<'info, DispenserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Dispense<'info> {
    #[account(mut)]
    pub dispenser_account: Account<'info, DispenserAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(signer)]
    pub dispenser_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: AccountInfo<'info>,
}

#[account]
pub struct DispenserAccount {
    pub dispenser_authority: Pubkey,
    pub dispenser_seed: String,
    pub amount: u64,
}
