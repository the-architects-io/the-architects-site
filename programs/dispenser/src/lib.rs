use anchor_lang::prelude::*;

declare_id!("4WtotNKD2Wz7nKMjsQdkU5MyfHpJiyaVfN4KhjhNosAr");

#[program]
pub mod dispenser {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
