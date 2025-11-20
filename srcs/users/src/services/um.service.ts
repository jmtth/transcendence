import { UserProfile, UserProfileDB } from "types/user-profile.db.js";

export function toUserProfile(dbProfile: UserProfileDB): UserProfile {
    return {
        id: dbProfile.id,
        username: dbProfile.username,
        avatarUrl: dbProfile.avatarUrl
    }
}