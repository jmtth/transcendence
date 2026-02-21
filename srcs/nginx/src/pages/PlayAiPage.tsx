import { useEffect, useRef, useState } from 'react';
import { createAiSession, joinAiToSession } from '../api/game-api';

const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDLE_W = 10;
const LEFT_PADDLE_X = 20;
const RIGHT_PADDLE_X = CANVAS_W - 30;

export const PlayAiPage = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error' | 'gameOver'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const myPaddle = useRef<'left' | 'right'>('left');

  const startGame = async () => {
    setStatus('loading');
    setError(null);
    try {
      // Step 1: create session
      const { sessionId } = await createAiSession();

      // Step 2: human player connects first (gets Player A = left paddle)
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${proto}://${window.location.host}/api/game/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Step 3: NOW tell AI to join (gets Player B = right paddle)
        joinAiToSession(sessionId);
        // AI will send { type: 'start' } automatically when it sees status='waiting'
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'connected') {
          // Determine paddle assignment (safety check)
          myPaddle.current = msg.message === 'Player A' ? 'left' : 'right';
          setStatus('playing');
          // Don't send 'start' — the AI handles that automatically
        } else if (msg.type === 'state' && msg.data) {
          setScores({ ...msg.data.scores });
          renderFrame(msg.data);
        } else if (msg.type === 'gameOver' && msg.data) {
          setScores({ ...msg.data.scores });
          renderFrame(msg.data);
          setStatus('gameOver');
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setStatus('error');
      };

      ws.onclose = () => {
        if (status === 'playing') setStatus('idle');
      };
    } catch (e: any) {
      setError(e.message || 'Failed to start game');
      setStatus('error');
    }
  };

  const renderFrame = (state: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Left paddle
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(LEFT_PADDLE_X, state.paddles.left.y, PADDLE_W, state.paddles.left.height);

    // Right paddle
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(RIGHT_PADDLE_X, state.paddles.right.y, PADDLE_W, state.paddles.right.height);

    // Scores
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(state.scores.left), CANVAS_W / 2 - 60, 50);
    ctx.fillText(String(state.scores.right), CANVAS_W / 2 + 60, 50);
  };

  // Keyboard controls — sends correct 'paddle' message
  useEffect(() => {
    if (status !== 'playing') return;
    const ws = wsRef.current;
    const pressed = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (!ws || pressed.has(e.key)) return;
      pressed.add(e.key);
      if (e.key === 'ArrowUp')
        ws.send(JSON.stringify({ type: 'paddle', paddle: myPaddle.current, direction: 'up' }));
      if (e.key === 'ArrowDown')
        ws.send(JSON.stringify({ type: 'paddle', paddle: myPaddle.current, direction: 'down' }));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.key);
      if (!ws) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        ws.send(JSON.stringify({ type: 'paddle', paddle: myPaddle.current, direction: 'stop' }));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [status]);

  useEffect(
    () => () => {
      wsRef.current?.close();
    },
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gap-6">
      <h1 className="text-3xl font-bold text-sky-400">Play vs AI</h1>

      {(status === 'idle' || status === 'error') && (
        <button
          onClick={startGame}
          className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-lg transition"
        >
          Start vs AI
        </button>
      )}
      {error && <p className="text-red-400">{error}</p>}
      {status === 'loading' && <p className="text-slate-400 animate-pulse">Setting up game...</p>}

      {(status === 'playing' || status === 'gameOver') && (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="border border-slate-700 rounded-lg"
          />
          {status === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-lg gap-4">
              <p className="text-2xl font-bold text-sky-300">
                {scores.left >= 5 ? 'You Win! 🎉' : 'AI Wins!'}
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
      {status === 'playing' && <p className="text-slate-500 text-sm">↑ / ↓ arrow keys to move</p>}
    </div>
  );
};
