use anchor_lang::prelude::*;

declare_id!("3mE2UAhuJxCbcHBCM4gFeWkJheDFw2q9iDykf3S9RDwx");

#[program]
pub mod architects {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn print_derived_pda(ctx: Context<PrintDerivedPda>, seed: Vec<u8>, bump: u8) -> Result<()> {
        msg!("Derived PDA passed in: {}", ctx.accounts.derived_pda.key);
        let seeds = &[&seed[..], &[bump]];
        let calculated_pda = Pubkey::create_program_address(seeds, ctx.program_id).unwrap();

        msg!("Derived PDA generated with bump: {}", calculated_pda);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(seed: Vec<u8>, bump: u8)]
pub struct PrintDerivedPda<'info> {
    /// CHECK: The `derived_pda`.
    #[account(seeds = [seed.as_slice()], bump = bump)]
    pub derived_pda: AccountInfo<'info>,
}
