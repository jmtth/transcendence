import { ProfileSimpleDTO } from '@transcendence/core';
import { useTranslation } from 'react-i18next';
import UserRow from '../components/molecules/UserRow';
import { Page } from '../components/organisms/PageContainer';
import { UserActions } from '../types/react-types';
import UserSearchContainer from '../components/molecules/UserSearchContainer';

export const FriendsPage = () => {
  const { t } = useTranslation();
  const friends: ProfileSimpleDTO[] = [
    {
      username: 'friend1',
      avatarUrl: 'src/assets/avatars/default.png',
    },
    {
      username: 'friend2',
      avatarUrl: 'src/assets/avatars/einstein_sq.jpg',
    },
    {
      username: 'friend3',
      avatarUrl: 'src/assets/avatars/bohr_sq.jpg',
    },
  ];
  const allowedActions: UserActions[] = [UserActions.PLAY, UserActions.REMOVE];
  return (
    <Page className="flex flex-col" title={t('friends.friends')}>
      <div className="border-b border-b-gray-300 mb-4">
        <h2 className=" font-quantico text-gray-500 mb-1">Add friend</h2>
      </div>
      <div className="mb-4 w-[100%]">
        <UserSearchContainer
          actions={[UserActions.ADD, UserActions.PLAY, UserActions.REMOVE]}
        ></UserSearchContainer>
      </div>
      <div className="border-b border-b-gray-300 mb-1">
        <h2 className=" font-quantico text-gray-500 mb-1">Existing friends</h2>
      </div>
      <div className="flex flex-col gap-2">
        {friends.map((f) => (
          <UserRow key={f.username} user={f} actions={allowedActions} />
        ))}
      </div>
    </Page>
  );
};
