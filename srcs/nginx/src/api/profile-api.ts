import {
  idDTO,
  idSchema,
  ProfileAuthDTO,
  ProfileDTO,
  usernameDTO,
  usernameSchema,
} from '@transcendence/core';
import api from './api-client';
import { authApi } from './auth-api';

export const profileApi = {
  getProfileByUsername: async (username: usernameDTO): Promise<ProfileDTO> => {
    usernameSchema.parse(username);
    const { data: profileData } = await api.get(`/users/username/${username}`);
    return {
      ...profileData,
    };
  },

  getProfileById: async (id: idDTO): Promise<ProfileDTO> => {
    idSchema.parse(id);
    const { data: profileData } = await api.get(`/users/${id}`);
    return {
      ...profileData,
    };
  },

  // to use to retrieve all user info (excepted id and role) (from auth + users) in one call
  getProfileAuthById: async (id: idDTO): Promise<ProfileAuthDTO> => {
    idSchema.parse(id);

    const [authRes, profileRes] = await Promise.all([
      authApi.me(id),
      profileApi.getProfileById(id),
    ]);
    return {
      ...profileRes,
      email: authRes.email,
    };
  },
};
