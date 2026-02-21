import { useEffect, useRef, useState, useCallback } from 'react';
import { createAiSession, joinAiToSession } from '../api/game-api';
import Background from '../components/atoms/Background';
import { NavBar } from '../components/molecules/NavBar';
import Button from '../components/atoms/Button';

// ─── Canvas constants (match server physics) ──────────────────────────────────
const CW = 800;
const CH = 600;
const PADDLE_W = 10;
const LEFT_X = 20;
const RIGHT_X = CW - 30;

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'loading' | 'playing' | 'gameOver' | 'error';

interface GameState {
  ball: { x: number; y: number; radius: number };
  paddles: {
    left: { y: number; height: number };
    right: { y: number; height: number };
  };
  scores: { left: number; right: number };
}

function drawFrame(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, CW, CH);

  // Center dashed line
  ctx.save();
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(CW / 2, 0);
  ctx.lineTo(CW / 2, CH);
  ctx.stroke();
  ctx.restore();

  // Paddle with glow
  const paddleGlow = (x: number, y: number, h: number, color: string) => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, PADDLE_W, h, 4);
    ctx.fill();
    ctx.restore();
  };

  paddleGlow(LEFT_X, state.paddles.left.y, state.paddles.left.height, '#38bdf8');
  paddleGlow(RIGHT_X, state.paddles.right.y, state.paddles.right.height, '#fb7185');

  // Ball glow
  ctx.save();
  ctx.shadowColor = '#e0f2fe';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#f0f9ff';
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Scores
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(state.scores.left), CW / 2 - 80, 60);
  ctx.fillText(String(state.scores.right), CW / 2 + 80, 60);
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PlayAiPage = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState<'you' | 'ai' | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const myPaddleRef = useRef<'left' | 'right'>('left');
  const phaseRef = useRef<Phase>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearSetupTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // ── Start game ──────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    setPhase('loading');
    setError(null);
    setScores({ left: 0, right: 0 });
    setWinner(null);

    // 10-second timeout: if no 'state' message received, show error
    timeoutRef.current = setTimeout(() => {
      if (phaseRef.current === 'loading' || phaseRef.current === 'playing') {
        wsRef.current?.close();
        setError(
          'Game did not start within 10s. Is the AI service running and is models/best_model.zip present?'
        );
        setPhase('error');
      }
    }, 10000);

    try {
      const { sessionId } = await createAiSession();
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${window.location.host}/api/game/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        joinAiToSession(sessionId).catch((e: any) => {
          clearSetupTimeout();
          setError('AI service error: ' + (e?.response?.data?.detail ?? e?.message ?? 'unknown'));
          setPhase('error');
          ws.close();
        });
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'connected') {
          myPaddleRef.current = msg.message === 'Player A' ? 'left' : 'right';
          // Don't clear timeout yet — wait for first 'state' to confirm game loop is running
        } else if (msg.type === 'state' && msg.data) {
          clearSetupTimeout(); // Game loop is alive
          if (phaseRef.current !== 'playing') setPhase('playing');
          setScores({ ...msg.data.scores });
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) drawFrame(ctx, msg.data);
          }
        } else if (msg.type === 'gameOver' && msg.data) {
          clearSetupTimeout();
          setScores({ ...msg.data.scores });
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) drawFrame(ctx, msg.data);
          }
          const myPaddle = myPaddleRef.current;
          const iWon =
            (myPaddle === 'left' && msg.data.scores.left >= msg.data.scores.right) ||
            (myPaddle === 'right' && msg.data.scores.right >= msg.data.scores.left);
          setWinner(iWon ? 'you' : 'ai');
          setPhase('gameOver');
        } else if (msg.type === 'error') {
          clearSetupTimeout();
          setError('Game error: ' + (msg.message ?? 'unknown'));
          setPhase('error');
        }
      };

      ws.onerror = () => {
        clearSetupTimeout();
        setError('WebSocket error — is the game service running?');
        setPhase('error');
      };

      ws.onclose = () => {
        clearSetupTimeout();
        if (phaseRef.current === 'playing') setPhase('idle');
      };
    } catch (e: any) {
      clearSetupTimeout();
      setError(e?.message ?? 'Failed to start game');
      setPhase('error');
    }
  }, []);

  // ── Keyboard controls ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const ws = wsRef.current;
    const pressed = new Set<string>();

    const send = (direction: 'up' | 'down' | 'stop') =>
      ws?.send(JSON.stringify({ type: 'paddle', paddle: myPaddleRef.current, direction }));

    const onDown = (e: KeyboardEvent) => {
      if (pressed.has(e.key)) return;
      pressed.add(e.key);
      if (e.key === 'ArrowUp') { e.preventDefault(); send('up'); }
      if (e.key === 'ArrowDown') { e.preventDefault(); send('down'); }
    };
    const onUp = (e: KeyboardEvent) => {
      pressed.delete(e.key);
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') send('stop');
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [phase]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => () => {
    clearSetupTimeout();
    wsRef.current?.close();
  }, []);

  // ── Mobile touch helpers ─────────────────────────────────────────────────────
  const sendDirection = (dir: 'up' | 'down' | 'stop') =>
    wsRef.current?.send(JSON.stringify({ type: 'paddle', paddle: myPaddleRef.current, direction: dir }));

  const myColor = myPaddleRef.current === 'left' ? '#38bdf8' : '#fb7185';
  const aiColor = myPaddleRef.current === 'left' ? '#fb7185' : '#38bdf8';

  return (
    <div className="w-full h-full relative">
      <Background
        grainIntensity={3}
        baseFrequency={0.28}
        colorStart="#00ff9f"
        colorEnd="#0088ff"
      >
        <div className="absolute top-0 left-0 w-full z-10">
          <NavBar />
        </div>

        <div className="flex flex-col items-center justify-center h-full gap-6 pt-16">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-4xl font-bold font-mono tracking-widest"
              style={{ color: '#f0f9ff', textShadow: '0 0 24px #38bdf8' }}>
              PONG vs AI
            </h1>
            {(phase === 'playing' || phase === 'gameOver') && (
              <div className="flex items-center gap-6 text-sm font-mono mt-1">
                <span style={{ color: myColor }}>YOU</span>
                <span className="text-slate-400 text-2xl font-bold">
                  {scores.left} : {scores.right}
                </span>
                <span style={{ color: aiColor }}>AI</span>
              </div>
            )}
          </div>

          {/* ── Canvas ─────────────────────────────────────────────────────── */}
          {(phase === 'playing' || phase === 'gameOver') && (
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CW}
                height={CH}
                className="rounded-xl"
                style={{
                  border: '2px solid #1e3a5f',
                  boxShadow: '0 0 40px rgba(56,189,248,0.15)',
                  maxWidth: '95vw',
                }}
              />

              {/* ── Game Over overlay ──────────────────────────────────────── */}
              {phase === 'gameOver' && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-xl"
                  style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(4px)' }}
                >
                  <p className="text-5xl">{winner === 'you' ? '🏆' : '🤖'}</p>
                  <p className="text-3xl font-bold font-mono"
                    style={{ color: winner === 'you' ? '#34d399' : '#fb7185' }}>
                    {winner === 'you' ? 'You Win!' : 'AI Wins!'}
                  </p>
                  <p className="text-slate-400 font-mono text-lg">
                    {scores.left} — {scores.right}
                  </p>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => { wsRef.current?.close(); startGame(); }}
                  >
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Idle / Error state ─────────────────────────────────────────── */}
          {(phase === 'idle' || phase === 'error') && (
            <div className="flex flex-col items-center gap-4">
              {error && (
                <p className="text-red-400 font-mono text-sm bg-red-900/20 border border-red-800 px-4 py-2 rounded-lg max-w-sm text-center">
                  ⚠ {error}
                </p>
              )}
              <Button
                variant="secondary"
                type="button"
                className="text-lg px-10 py-3"
                onClick={startGame}
              >
                ▶ Start vs AI
              </Button>
              <p className="text-slate-400/60 font-mono text-xs">
                Use ↑ / ↓ arrow keys to move your paddle
              </p>
            </div>
          )}

          {/* ── Loading state ──────────────────────────────────────────────── */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-mono text-sm animate-pulse">Setting up game…</p>
              <p className="text-slate-600 font-mono text-xs">Waiting for AI to connect (max 10s)</p>
            </div>
          )}

          {/* ── Playing hints + mobile controls ───────────────────────────── */}
          {phase === 'playing' && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-500 font-mono text-xs hidden sm:block">
                ↑ / ↓ arrow keys · First to 5 wins
              </p>
              <div className="flex gap-6 sm:hidden">
                <button
                  onPointerDown={() => sendDirection('up')}
                  onPointerUp={() => sendDirection('stop')}
                  onPointerLeave={() => sendDirection('stop')}
                  className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500 text-2xl flex items-center justify-center active:bg-slate-700 select-none"
                  aria-label="Move up"
                >▲</button>
                <button
                  onPointerDown={() => sendDirection('down')}
                  onPointerUp={() => sendDirection('stop')}
                  onPointerLeave={() => sendDirection('stop')}
                  className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-500 text-2xl flex items-center justify-center active:bg-slate-700 select-none"
                  aria-label="Move down"
                >▼</button>
              </div>
            </div>
          )}
        </div>
      </Background>
    </div>
  );
};
