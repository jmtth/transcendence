import { useState } from "react";
import { UserProfileDTO } from "../schemas/profile.schema"
import defaultAvatar from '../assets/avatars/default.png';

/**
 * @todo guards for avatar url format
 */
  interface Props {
    user: UserProfileDTO;
  }

export const UserProfile = ({user}: Props) => {
  const [fallback, setFallback] = useState(false);

  const getAvatarPath = () => {
    if (fallback) {
      return defaultAvatar;
    }
    if (!user.avatarUrl) {
      return defaultAvatar;
    }
    return `/uploads/${user.avatarUrl}`
  };

  const avatarPath = getAvatarPath();

  return (
    <div className="flex items-center gap-4">
      <img 
        src={avatarPath}
        alt={`${user.username} avatar`}
        className="h-12 w-12 rounded-full object-cover border border-slate-700"
        onError={() => setFallback(true)}
      />
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{user.username}</span>
      </div>
    </div>
  )
}