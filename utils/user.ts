import { User } from "@/features/admin/users/users-list-item";
import { Account } from "@/pages/api/add-account";

export const getUserDiscordAccount = (user: User) => {
  if (!user?.accounts || user?.accounts?.length === 0) return null;
  return user.accounts.reduce(
    (acc, account) =>
      acc || account.provider.id === "eea4c92e-4ac4-4203-8c19-cba7f7b8d4f6"
  );
};
