// Type definitions
interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface Paddle {
  y: number;
  height: number;
  width: number;
  speed: number;
  moving: 'up' | 'down' | 'stop';
}

interface Paddles {
  left: Paddle;
  right: Paddle;
}

interface Scores {
  left: number;
  right: number;
}

type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

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

// Pong Game Engine
export class PongGame {
  sessionId: string;
  width: number;
  height: number;
  ball: Ball;
  paddles: Paddles;
  scores: Scores;
  status: GameStatus;
  gameLoopInterval: NodeJS.Timeout | null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.width = 800;
    this.height = 600;
    
    // Ball state
    this.ball = {
      x: this.width / 2,
      y: this.height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 5
    };
    
    // Paddle state
    this.paddles = {
      left: {
        y: this.height / 2 - 50,
        height: 100,
        width: 10,
        speed: 8,
        moving: 'stop'
      },
      right: {
        y: this.height / 2 - 50,
        height: 100,
        width: 10,
        speed: 8,
        moving: 'stop'
      }
    };
    
    // Game state
    this.scores = { left: 0, right: 0 };
    this.status = 'waiting';
    this.gameLoopInterval = null;
  }

  setPaddleDirection(paddle: 'left' | 'right', direction: 'up' | 'down' | 'stop'): void {
    if (this.paddles[paddle]) {
      this.paddles[paddle].moving = direction;
      console.log(`[${this.sessionId}] ${paddle} paddle moving ${direction}`);
    }
  }

  start(): void {
    if (this.status === 'playing') return;
    
    this.status = 'playing';
    console.log(`[${this.sessionId}] Game started`);
    
    // Run game loop at 60 FPS
    this.gameLoopInterval = setInterval(() => {
      this.update();
    }, 1000 / 60);
  }

  stop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    this.status = 'paused';
    console.log(`[${this.sessionId}] Game stopped`);
  }

  update(): void {
    // Move ball
    this.ball.x += this.ball.velocityX;
    this.ball.y += this.ball.velocityY;

    // Move paddles based on player input
    if (this.paddles.left.moving === 'up') {
      this.paddles.left.y -= this.paddles.left.speed;
    } else if (this.paddles.left.moving === 'down') {
      this.paddles.left.y += this.paddles.left.speed;
    }

    if (this.paddles.right.moving === 'up') {
      this.paddles.right.y -= this.paddles.right.speed;
    } else if (this.paddles.right.moving === 'down') {
      this.paddles.right.y += this.paddles.right.speed;
    }

    // Ball collision with top/bottom walls
    if (this.ball.y - this.ball.radius <= 0 || 
        this.ball.y + this.ball.radius >= this.height) {
      this.ball.velocityY = -this.ball.velocityY;
    }

    // Ball collision with left paddle
    if (this.ball.x - this.ball.radius <= 20 + this.paddles.left.width) {
      if (this.ball.y >= this.paddles.left.y && 
          this.ball.y <= this.paddles.left.y + this.paddles.left.height) {
        this.ball.velocityX = -this.ball.velocityX;
        
        // Add spin based on where ball hits paddle
        const hitPos = (this.ball.y - this.paddles.left.y) / this.paddles.left.height;
        this.ball.velocityY = (hitPos - 0.5) * 10;
      }
    }

    // Ball collision with right paddle
    if (this.ball.x + this.ball.radius >= this.width - 20 - this.paddles.right.width) {
      if (this.ball.y >= this.paddles.right.y && 
          this.ball.y <= this.paddles.right.y + this.paddles.right.height) {
        this.ball.velocityX = -this.ball.velocityX;
        
        const hitPos = (this.ball.y - this.paddles.right.y) / this.paddles.right.height;
        this.ball.velocityY = (hitPos - 0.5) * 10;
      }
    }

    // Ball out of bounds - scoring
    if (this.ball.x - this.ball.radius <= 0) {
      // Right player scores
      this.scores.right++;
      this.resetBall();
      console.log(`[${this.sessionId}] Score: ${this.scores.left} - ${this.scores.right}`);
    } else if (this.ball.x + this.ball.radius >= this.width) {
      // Left player scores
      this.scores.left++;
      this.resetBall();
      console.log(`[${this.sessionId}] Score: ${this.scores.left} - ${this.scores.right}`);
    }

    // Keep paddles within bounds
    this.paddles.left.y = Math.max(0, Math.min(this.height - this.paddles.left.height, this.paddles.left.y));
    this.paddles.right.y = Math.max(0, Math.min(this.height - this.paddles.right.height, this.paddles.right.y));

    // Check win condition
    if (this.scores.left >= 5 || this.scores.right >= 5) {
      this.status = 'finished';
      this.stop();
      console.log(`[${this.sessionId}] Game finished! Final score: ${this.scores.left} - ${this.scores.right}`);
    }
  }

  resetBall(): void {
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    this.ball.velocityX = -this.ball.velocityX;
    this.ball.velocityY = (Math.random() - 0.5) * 10;
  }

  getState(): GameState {
    return {
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        radius: this.ball.radius
      },
      paddles: {
        left: {
          y: this.paddles.left.y,
          height: this.paddles.left.height
        },
        right: {
          y: this.paddles.right.y,
          height: this.paddles.right.height
        }
      },
      scores: this.scores,
      status: this.status
    };
  }
}
