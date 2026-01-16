import { UserProfile } from '@prisma/client';
import {
  ERR_DEFS,
  LOG_RESOURCES,
  type ProfileCreateInDTO,
  type ProfileDTO,
  AppError,
} from '@transcendence/core';
import { Trace } from '../utils/decorators.js';
import { profileRepository } from '../data/profiles.data.js';

async function getProfileOrThrow(username: string): Promise<ProfileDTO> {
  const profile = await profileRepository.findProfileByUsername(username);
  if (!profile) {
    throw new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {
      details: {
        resource: LOG_RESOURCES.PROFILE,
        username: username,
      },
    });
  }
  return profile;
}

export class ProfileService {
  @Trace
  async createProfile(payload: ProfileCreateInDTO): Promise<UserProfile> {
    return await profileRepository.createProfile(payload);
  }

  @Trace
  async getByUsername(username: string): Promise<ProfileDTO | null> {
    const profile = await getProfileOrThrow(username);
    return profile;
  }

  @Trace
  async getById(authId: number): Promise<ProfileDTO | null> {
    const profile = await profileRepository.findProfileById(authId);
    if (!profile) {
      throw new AppError(ERR_DEFS.RESOURCE_NOT_FOUND, {
        details: {
          resource: LOG_RESOURCES.PROFILE,
          id: authId,
        },
      });
    }
    return profile;
  }

  async updateAvatarUrl(username: string, newAvatarUrl: string): Promise<ProfileDTO> {
    const profile = await getProfileOrThrow(username);
    const updatedProfile = await profileRepository.updateProfileAvatar(
      profile.authId,
      newAvatarUrl,
    );
    return updatedProfile;
  }

  async deleteByUsername(username: string): Promise<ProfileDTO> {
    const profile = await getProfileOrThrow(username);
    const deletedProfile = await profileRepository.deleteProfile(profile.authId);
    return deletedProfile;
  }
}

export const profileService = new ProfileService();
