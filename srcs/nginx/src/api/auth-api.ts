import {
  idDTO,
  IdSchema,
  UserDTO,
  UserLoginDTO,
  UserLoginSchema,
  usernameDTO,
  UserRegisterDTO,
  UserRegisterSchema,
} from '@transcendence/core';
import api from './api-client';

export const authApi = {
  register: async (payload: UserRegisterDTO): Promise<idDTO> => {
    UserRegisterSchema.parse(payload);
    const { data } = await api.post(`/auth/register`, payload);
    return data.result.id;
  },

  login: async (payload: UserLoginDTO): Promise<{ username: string; token: string }> => {
    UserLoginSchema.parse(payload);
    const { data } = await api.post(`/auth/login`, payload);
    return data.result.username;
  },

  me: async (param: idDTO): Promise<UserDTO> => {
    IdSchema.parse(param);
    // const response = await api.get(`/auth/me/${param}`);
    const response = {
      data: {
        authId: 1,
        email: 'toto@mail.com',
        username: 'toto',
      },
      message: 'OK',
    };
    return response.data;
  },
};
