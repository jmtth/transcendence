import { useParams } from 'react-router-dom';
import Toggle from '../components/atoms/Toggle';
import FileUploader from '../components/molecules/FileUploader';
import { Page } from '../components/organisms/PageContainer';
import { useAuth } from '../components/helpers/AuthProvider';
import Avatar from '../components/atoms/Avatar';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile-api';

const loadAvatar = () => {};

const toggle2FA = () => {};

// TODO have auth getUserById endpoint to provide role and email
export const ProfilePage = () => {
  const params = useParams();
  const username = params.username;
  const { user: authUser } = useAuth();
  const {
    data: displayedUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['username', username],
    queryFn: () => {
      return profileApi.getProfileByUsername(username!);
    },
    enabled: !!username,
    // enabled: !!username && !!authUser,
  });

  const isOwner = authUser && authUser.username === username;

  if (isLoading) {
    return (
      <Page>
        <div>Loading...</div>
      </Page>
    );
  }

  if (isError || !displayedUser) {
    return (
      <Page>
        <div>404 not found</div>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col">
      <div className="flex flex-col gap-4">
        {/* Public section */}
        <div className="mb-3">
          <h1 className="m-2 text-gray-600 font-bold text-xl font-quantico">Profile</h1>
          <div className="flex flex-col items-center">
            <Avatar src={displayedUser.avatarUrl} size="lg"></Avatar>
            <h2 className="mt-2 ts-form-title">{displayedUser.username}</h2>
          </div>
        </div>

        {/* Owner or Admin only section */}
        {isOwner && (
          <>
            <div className="mb-3">
              <h1 className="m-2 text-gray-600 font-bold text-xl font-quantico">2FA</h1>
              <div className="flex flex-row justify-center">
                <Toggle onToggle={toggle2FA} className="mr-3"></Toggle>
                <label htmlFor="Toggle" className="text-gray-600">
                  disabled
                </label>
              </div>
            </div>

            <div className="mb-3">
              <h1 className="m-2 text-gray-600 font-bold text-xl font-quantico">Update avatar</h1>
              <div className="flex flex-row justify-center">
                <FileUploader onClick={loadAvatar}></FileUploader>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
};
