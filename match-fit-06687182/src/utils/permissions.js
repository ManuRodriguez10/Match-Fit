export const isHeadCoach = (user) => {
  return user?.team_role === "coach" && user?.coach_role === "head_coach";
};

export const isAssistantCoach = (user) => {
  return user?.team_role === "coach" && user?.coach_role === "assistant_coach";
};

export const canManageTeamSettings = (user) => {
  return isHeadCoach(user);
};

export const canInviteCoaches = (user) => {
  return isHeadCoach(user);
};

export const canDeleteTeam = (user) => {
  return isHeadCoach(user);
};

export const canRemovePlayers = (user) => {
  return isHeadCoach(user) || isAssistantCoach(user);
};

export const canRemoveCoaches = (user) => {
  return isHeadCoach(user);
};
