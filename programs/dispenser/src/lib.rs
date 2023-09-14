use anchor_lang::prelude::*;
use anchor_lang::system_program::ID as system_program_id;
use anchor_spl::token::{self, Mint, Token};
use borsh::BorshDeserialize;

declare_id!("4gWo4AXW987N93RAiuoJJF51FwFV5Yyza4CYZ9j6qSYJ");

#[account]
pub struct DispenserAccount {
    pub is_initialized: bool,
    // ... other fields ...
}

// #[derive(Clone, Debug, PartialEq, BorshSerialize, BorshDeserialize)]
// pub enum TokenType {
//     SPL,
//     NFT,
//     SFT,
// }

#[error_code]
pub enum DispenserErrorCode {
    #[msg("The account is uninitialized.")]
    UninitializedAccount,
    #[msg("Invalid instruction provided.")]
    InvalidInstruction,
    #[msg("Program derived address mismatch.")]
    PdaMismatch,
    #[msg("Failed to generate program derived address.")]
    PdaGenerationFailed,
    #[msg("The account is already initialized.")]
    AlreadyInitialized,
    #[msg("Token transfer failed.")]
    TokenTransferFailed,
    #[msg("Invalid amount provided.")]
    InvalidAmount,
    #[msg("Potential underflow detected.")]
    PotentialUnderflow,
    #[msg("The contract is already paused.")]
    AlreadyPaused,
    #[msg("Cannot execute, the contract is paused.")]
    Paused,
}

#[derive(Accounts)]
#[instruction(seed: Vec<u8>, authority_seed: Vec<u8>, bump: u8)]
pub struct CreateDispenser<'info> {
    #[account(
        seeds = [seed.as_slice(), authority_seed.as_slice()],
        bump, init, payer = user, space = 9,
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

#[derive(Accounts)]
#[instruction(seed: Vec<u8>, authority_seed: Vec<u8>, bump: u8, amount: u64)]
pub struct DispenseTokens<'info> {
    /// CHECK: The `sender` (PDA) exists and has permissions to perform operations. This will represent the derived PDA.
    #[account(mut)]
    pub sender: AccountInfo<'info>,
    /// CHECK: The `recipient` account exists and can accept lamports.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    /// CHECK: The `dispenser_pda` is the PDA that owns the `sender` account.
    #[account(seeds = [seed.as_slice(), authority_seed.as_slice()], bump = bump)]
    pub dispenser_pda: AccountInfo<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: The system program is required to create the account.
    #[account(address = system_program_id)]
    pub system_program: Program<'info, System>,
    /// CHECK: The SPL token program is required to create the account.
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
    // pub global_state: Account<'info, GlobalState>,
}

#[derive(Accounts)]
#[instruction(seed: Vec<u8>, authority_seed: Vec<u8>, bump: u8, amount: u64)]
pub struct DispenseSol<'info> {
    /// CHECK: The `sender` (PDA) exists and has permissions to perform operations. This will represent the derived PDA.
    #[account(mut)]
    pub sender: AccountInfo<'info>,
    /// CHECK: The `recipient` account exists and can accept lamports.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    /// CHECK: The `dispenser_pda` is the PDA that owns the `sender` account.
    #[account(seeds = [seed.as_slice(), authority_seed.as_slice()], bump = bump)]
    pub dispenser_pda: AccountInfo<'info>,
    /// CHECK: The system program is required to create the account.
    #[account(address = system_program_id)]
    pub system_program: AccountInfo<'info>,
    // pub global_state: Account<'info, GlobalState>,
}

// #[account]
// pub struct GlobalState {
//     paused: bool,
//     owner: Pubkey,
// }

// #[derive(Accounts)]
// pub struct PauseContract<'info> {
//     #[account(
//         mut,
//         constraint = global_state.owner == *owner.key
//     )]
//     pub global_state: Account<'info, GlobalState>,
//     pub owner: Signer<'info>,
// }

// #[derive(Accounts)]
// pub struct UnpauseContract<'info> {
//     #[account(
//         mut,
//         constraint = global_state.owner == *owner.key
//     )]
//     pub global_state: Account<'info, GlobalState>,
//     pub owner: Signer<'info>,
// }

#[program]
pub mod dispenser {
    use super::*;

    pub fn create_dispenser(
        ctx: Context<CreateDispenser>,
        _seed: Vec<u8>,
        _authority_seed: Vec<u8>,
        _bump: u8,
    ) -> Result<()> {
        let dispenser_account: &mut DispenserAccount = &mut ctx.accounts.dispenser_account;
        if dispenser_account.is_initialized {
            return Err(DispenserErrorCode::AlreadyInitialized.into());
        }
        dispenser_account.is_initialized = true;

        Ok(())
    }

    pub fn dispense_tokens(
        ctx: Context<DispenseTokens>,
        seed: Vec<u8>,
        authority_seed: Vec<u8>,
        bump: u8,
        amount: u64,
    ) -> Result<()> {
        // if ctx.accounts.global_state.paused {
        //     return Err(DispenserErrorCode::Paused.into());
        // }

        if amount == 0 {
            return Err(DispenserErrorCode::InvalidAmount.into());
        }

        let seeds = &[&seed[..], &authority_seed[..], &[bump]];

        let calculated_pda = Pubkey::create_program_address(seeds, ctx.program_id)
            .map_err(|_| DispenserErrorCode::PdaGenerationFailed)?;

        if *ctx.accounts.dispenser_pda.key != calculated_pda {
            return Err(DispenserErrorCode::PdaMismatch.into());
        }

        let cpi_accounts = token::Transfer {
            from: ctx.accounts.sender.to_account_info().clone(),
            to: ctx.accounts.recipient.to_account_info().clone(),
            authority: ctx.accounts.dispenser_pda.to_account_info().clone(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info().clone();

        let bump_seed: &[u8] = &[bump];
        let signer_seeds: &[&[&[u8]]] = &[&[&seed[..], &authority_seed[..], bump_seed]];

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);

        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn dispense_sol(
        ctx: Context<DispenseSol>,
        seed: Vec<u8>,
        authority_seed: Vec<u8>,
        bump: u8,
        amount: u64,
    ) -> Result<()> {
        // if ctx.accounts.global_state.paused {
        //     return Err(DispenserErrorCode::Paused.into());
        // }

        if amount == 0 {
            return Err(DispenserErrorCode::InvalidAmount.into());
        }

        let seeds = &[&seed[..], &authority_seed[..], &[bump]];

        let calculated_pda = Pubkey::create_program_address(seeds, ctx.program_id)
            .map_err(|_| DispenserErrorCode::PdaGenerationFailed)?;

        if *ctx.accounts.dispenser_pda.key != calculated_pda {
            return Err(DispenserErrorCode::PdaMismatch.into());
        }

        let sender = &ctx.accounts.sender;
        let recipient = &ctx.accounts.recipient;

        // Check for potential underflow condition
        if **sender.lamports.borrow() < amount {
            return Err(DispenserErrorCode::PotentialUnderflow.into());
        }

        **recipient.lamports.borrow_mut() += amount;
        **sender.lamports.borrow_mut() -= amount;

        Ok(())
    }

    // pub fn pause_contract(ctx: Context<PauseContract>) -> Result<()> {
    //     let global_state = &mut ctx.accounts.global_state;
    //     if global_state.paused {
    //         return Err(DispenserErrorCode::AlreadyPaused.into());
    //     }
    //     global_state.paused = true;
    //     Ok(())
    // }

    // pub fn unpause_contract(ctx: Context<PauseContract>) -> Result<()> {
    //     let global_state = &mut ctx.accounts.global_state;
    //     if !global_state.paused {
    //         return Err(DispenserErrorCode::AlreadyPaused.into());
    //     }
    //     global_state.paused = false;
    //     Ok(())
    // }
}
