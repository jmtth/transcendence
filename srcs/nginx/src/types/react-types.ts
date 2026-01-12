import { UserDTO } from '@transcendence/core';
import { ReactNode } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export enum MenuActions {
  HOME = 'home',
  PLAY = 'play',
  PROFILE = 'profile',
}

export interface AuthContextType {
  user: UserDTO | null;
  login: (user: UserDTO) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}
