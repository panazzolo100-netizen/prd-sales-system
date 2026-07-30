import {
  completeUserFirstAccess,
} from "@/repositories/users.repository";
import {
  getCurrentUserAccess,
} from "@/services/auth.service";

export async function getCurrentUserPasswordStatus() {
  const user = await getCurrentUserAccess();

  return {
    forcePasswordChange:
      user.forcePasswordChange,
    temporaryPassword:
      user.temporaryPassword,
  };
}

export async function finishCurrentUserFirstAccess() {
  const user = await getCurrentUserAccess();

  if (!user.forcePasswordChange) {
    return {
      success: true,
      alreadyCompleted: true,
    };
  }

  await completeUserFirstAccess(
    user.id,
    user.companyId
  );

  return {
    success: true,
    alreadyCompleted: false,
  };
}