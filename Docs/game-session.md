## game service 

### Memory management: 

    const gameSessions = new Map<string, PongGame>();
    const playerConnections = new Map<string, Set<WebSocket>>();

### Routes:

-> api/game/health

    return:
        status: 'healthy',
        service: 'websocket-game-service',
        activeSessions: gameSessions.size,
        activeConnections: Array.from(playerConnections.values())
          .reduce((sum, conns) => sum + conns.size, 0),
        timestamp: new Date().toISOString()

-> api/game/create-session 

    Mise en place d'une nouvelle session de jeu avec:
    - ID de sessions -> sessionId = randomUUID();
    - nouvelle instance de jeu -> const game = new PongGame(sessionId);

    return:
        status: 'success',
        message: 'Game session created',
        sessionId,
        wsUrl: `/game/${sessionId}`

-> api/game/:sessionId

    Websocket endpoint

    1) If no game exist at sessionId, create a new game.
    2) add the new player connection. 
    3) send ServerMessage of success:
        ws.send(JSON.stringify({
          type: 'connected',
          sessionId,
          message: 'Connected to game session',
          data: game.getState()
        } as ServerMessage));
    4) Start broadcasting game state at 60fps.

-> api/game/sessions

    Show current array of running game sessions (debug purpose).
    
### Communication par WebSocket 

    Une seule connection par client, echange de messages en continue.
    Message du server delivre a 60FPS a tous les clients de la session de jeu.

    Expected message by the server:

    ```
    interface ClientMessage {
      type: 'paddle' | 'start' | 'stop' | 'ping';
      paddle?: 'left' | 'right';
      direction?: 'up' | 'down' | 'stop';
    }
    ```

    Expected message by the client:

    ```
    interface ServerMessage {
      type: 'connected' | 'state' | 'gameOver' | 'error' | 'pong';
      sessionId?: string;
      data?: any;
      message?: string;
    }
    ```

    Use of a switch to set actions on client message:

    Message's types: 
    - paddle (move paddles)
    - ping (answer pong)
    - stop (stop the current game session)
    - start (start a new game session)

    serverMessage.data = game.getState()

## Game Logic

    Server broadcast game state as:
    ```
     interface GameState {
      ball: {
        x: number;
        y: number;
        radius: number;
      };
      paddles: {
        left: {
          y: number;
          height: number;
        };
        right: {
          y: number;
          height: number;
        };
      };
      scores: Scores;
      status: GameStatus;
    }
    ```
