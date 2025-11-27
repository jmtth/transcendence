import { UserProfile, UserProfileDB } from "types/user-profile.db.js";
import * as db from "data/database.js";

// export function toUserProfile(dbProfile: UserProfileDB): UserProfile {
//     return {
//         id: dbProfile.id,
//         username: dbProfile.username,
//         avatarUrl: dbProfile.avatarUrl
//     }
// }

export function findByUsername(username: string) {
    return db.findProfileByUsername(username);
}