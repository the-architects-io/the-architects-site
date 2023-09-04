use anchor_lang::prelude::*;
use anchor_lang::system_program::ID as system_program_id;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("29Phfb8pDz2DifXVafuDHFFmg6MrcFKCGEbQXmjoSGWL");

#[program]
pub mod dispenser {
    use super::*;

    pub fn create_dispenser(ctx: Context<CreateDispenser>, _seed: String, _bump: u8) -> Result<()> {
        let dispenser_account: &mut DispenserAccount = &mut ctx.accounts.dispenser_account;
        dispenser_account.is_initialized = true;
        // ... set other fields as needed ...

        Ok(())
    }

    pub fn dispense_tokens(ctx: Context<DispenseTokens>, amount: u64) -> Result<()> {
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.sender_tokens.to_account_info().clone(),
            to: ctx.accounts.recipient_tokens.to_account_info().clone(),
            authority: ctx.accounts.sender.to_account_info().clone(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info().clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)
    }

    pub fn dispense_sol(
        ctx: Context<DispenseSol>,
        _sender_pubkey: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let sender = &ctx.accounts.sender;
        let recipient = &ctx.accounts.recipient;

        // Transfer lamports
        **recipient.lamports.borrow_mut() += amount;
        **sender.lamports.borrow_mut() -= amount;

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

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DispenseTokens<'info> {
    /// CHECK: Ensure the sender is the transaction signer and has sufficient lamports for the transfer.
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub sender_tokens: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_tokens: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: The system program is required to create the account.
    #[account(address = system_program_id)]
    pub system_program: Program<'info, System>,
    /// CHECK: The SPL token program is required to create the account.
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DispenseSol<'info> {
    /// CHECK: The `sender` (PDA) exists and has permissions to perform operations.
    #[account(mut)]
    pub sender: AccountInfo<'info>, // This will represent the derived PDA
    /// CHECK: The `recipient` account exists and can accept lamports.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    /// CHECK: The system program is required to create the account.
    #[account(address = system_program_id)]
    pub system_program: AccountInfo<'info>,
}
