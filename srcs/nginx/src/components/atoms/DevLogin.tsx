import { ProfileAuthDTO, RoleDTO } from '@transcendence/core';
import { Roles } from '../../types/react-types';
import Button from './Button';
import { useAuth } from '../helpers/AuthProvider';
import { authApi } from '../../api/auth-api';

export const DevLoginButtons = () => {
  const { login, logout } = useAuth();

  const fakeUser = (role: RoleDTO): ProfileAuthDTO => {
    return {
      authId: role === Roles.ADMIN ? 1 : 2,
      email: 'test@mail.com',
      username: role === Roles.ADMIN ? 'Admin' : 'Toto',
      avatarUrl: role === Roles.ADMIN ? 'einstein_sq.jpg' : 'default.png',
    };
  };

  const handleDevLogin = (role: RoleDTO) => {
    try {
      const user = fakeUser(role);
      const credentials = {
        password: 'Password123!',
        username: user.username,
      };
      const response = authApi.login(credentials);
      console.log(`Login success for ${response}`);
      login(user);
    } catch (error) {
      console.error(`Login error:`, error);
    }
  };

  const handleDevRegister = (role: RoleDTO) => {
    try {
      const user = fakeUser(role);
      const credentials = {
        password: 'Password123!',
        username: user.username,
        email: user.email,
      };
      const response = authApi.register(credentials);
      console.log(`Regster success for ${response}`);
    } catch (error) {
      console.error(`Login error:`, error);
    }
  };

  return (
    <div className="flex flex-col">
      <Button onClick={() => handleDevRegister(Roles.USER)}>Register user</Button>
      <Button onClick={() => handleDevRegister(Roles.ADMIN)}>Register admin</Button>
      <Button onClick={() => handleDevLogin(Roles.USER)}>Login user</Button>
      <Button onClick={() => handleDevLogin(Roles.ADMIN)}>Login admin</Button>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
};
