import Toggle from '../components/atoms/Toggle';
import FileUploader from '../components/molecules/FileUploader';
import { Page } from '../components/organisms/PageContainer';

const loadAvatar = () => {};

const toggle2FA = () => {};

export const ProfilePage = () => {
  return (
    <Page className="flex flex-col">
      <Toggle onToggle={toggle2FA}></Toggle>
      <FileUploader onClick={loadAvatar}></FileUploader>
    </Page>
  );
};
