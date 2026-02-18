import { useState, useEffect } from 'react';
import {
  TournamentTableDesktop,
  TournamentListMobile,
  Tournament,
} from '../components/atoms/TournamentList';
import { useNavigate } from 'react-router-dom';
import { TournamentDTO } from '@transcendence/core';
import api from '../api/api-client';

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'Spin Cup #42',
    players: 2,
    maxPlayers: 4,
    status: 'WAITING',
    createdAt: '2026-02-01',
  },
  {
    id: '2',
    name: 'Weekly Pong',
    players: 4,
    maxPlayers: 4,
    status: 'IN_PROGRESS',
    createdAt: '2026-02-03',
  },
];

function mapTournamentDTO(dto: TournamentDTO): Tournament {
  return {
    id: dto.id.toString(),
    name: `Tournament by ${dto.username}`,
    players: dto.player_count,
    maxPlayers: 4, // valeur fixe ou future colonne
    status: dto.status === 'PENDING' ? 'WAITING' : 'IN_PROGRESS',
    createdAt: new Date().toISOString(), // ou champ futur
  };
}

/*
 * This component links to two other components depending on the media because
 * tables do not display correctly on mobile devices.
 */
export default function TournamentsListPage() {
  const [tournaments, setTournament] = useState<Tournament[]>([]);
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await api.get<TournamentDTO[]>(`/game/tournaments`);
        setTournament(data.map(mapTournamentDTO));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTournaments();
    const interval = setInterval(fetchTournaments, 5000);
    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();
  return (
    <>
      <div className="hidden md:block w-full">
        <TournamentTableDesktop
          tournaments={tournaments}
          onJoin={(id) => navigate(`/tournaments/${id}`)}
        />
      </div>

      <div className="md:hidden space-y-4 w-full">
        <TournamentListMobile
          tournaments={tournaments}
          onJoin={(id) => navigate(`/tournaments/${id}`)}
        />
      </div>
    </>
  );
}
