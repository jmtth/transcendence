import { NavBar } from '../components/molecules/NavBar';
import Background from '../components/atoms/Background';
import { useTranslation } from 'react-i18next';
import { CircleButton } from '../components/atoms/CircleButton';
import Scrollable from '../components/atoms/Scrollable';
import { Link } from 'react-router-dom';
import { Footer } from '../components/molecules/Footer';

const colors = {
  start: '#00ff9f',
  end: '#0088ff',
};

/**
 * HomePage — Page d'accueil pour les utilisateurs authentifiés.
 * Responsabilités :
 * - Affiche les options principales du site (jouer, tournois, etc.)
 */
export const HomePage = () => {
  const { t } = useTranslation();

  const menuItems = [
    { to: '/game/pong-ai', label: 'game.playWithAI', size: 220 },
    { to: '/game/simple-game', label: 'game.playWithFriends', size: 280 },
    { to: '/game/tournament', label: 'game.tournament', size: 250 },
    { to: '/game/remote', label: 'game.playRemote', size: 220 },
    { to: '/game/local', label: 'game.playLocal', size: 280 },
  ];

  const isOdd = menuItems.length % 2 !== 0;

  return (
    <div className="w-full h-screen overflow-hidden">
      <Background colorStart={colors.start} colorEnd={colors.end}>
        <div className="flex flex-col h-full">
          <NavBar />

          <main className="grow overflow-hidden">
            <Scrollable
              className="h-full md:grid md:grid-cols-2 md:place-items-center md:gap-x-12 md:gap-y-12 lg:gap-8"
              isAnimated={true}
            >
              {menuItems.map((item, index) => {
                const isCentered = isOdd && index === menuItems.length - 1;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      isCentered
                        ? 'md:col-span-2 flex justify-center w-full'
                        : 'flex justify-center w-full'
                    }
                  >
                    <CircleButton size={item.size} isMoving={true}>
                      {t(item.label)}
                    </CircleButton>
                  </Link>
                );
              })}
            </Scrollable>
          </main>

          <Footer />
    <div className="w-full h-full relative">
      <Background
        grainIntensity={4}
        baseFrequency={0.28}
        colorStart={colors.start}
        colorEnd={colors.end}
      >
        <NavBar />
        <div className="flex flex-col justify-around">
          <Scrollable
            className="h-[90vh] md:grid md:grid-cols-2 md:place-items-center"
            divClassName="mt-0"
            isAnimated={true}
          >
            <Link to="/game/pong-ai">
              <CircleButton size={220} isMoving={true}>
                {t('game.playWithAI')}
              </CircleButton>
            </Link>
            <Link to="/friends">
              <CircleButton size={280} isMoving={true}>
                {t('game.playWithFriends')}
              </CircleButton>
            </Link>
            <Link className="md:col-span-2" to="/tournaments">
              <CircleButton className="md:col-span-2" size={250} isMoving={true}>
                {t('game.tournament')}
              </CircleButton>
            </Link>
            <Link to="/game/remote">
              <CircleButton size={220} isMoving={true}>
                {t('game.playRemote')}
              </CircleButton>
            </Link>
            <Link to="/game/local">
              <CircleButton size={280} isMoving={true}>
                {t('game.playLocal')}
              </CircleButton>
            </Link>
            <Footer className="z-15"></Footer>
          </Scrollable>
        </div>
      </Background>
    </div>
  );
};
