import { NavBar } from '../components/molecules/NavBar'; // Adjust path based on your folder structure
import Halo from '../components/molecules/Halo';
import { Link } from 'react-router-dom';
import Background from '../components/atoms/Background';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { LoginForm } from '../components/organisms/LoginForm';
import { useState } from 'react';

const colors = {
  start: '#00ff9f',
  end: '#0088ff',
};

interface LoginRegisterPageProps {
  isRegister: boolean;
}

export const WelcomePage = () => {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const title = isRegister ? t('auth.signup') : t('auth.login');
  return (
    <div className={`w-full h-full relative`}>
      <Background
        grainIntensity={4}
        baseFrequency={0.28}
        colorStart={colors.start}
        colorEnd={colors.end}
      >
        <NavBar />
        <Halo
          size={200}
          isRegister={isRegister}
          onToggleForm={() => setIsRegister(!isRegister)}
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </Background>
    </div>
  );
};
