import { createNoise3D } from 'simplex-noise';
import Alea from 'alea';
import { Vector2 } from './game.vector.js'

export class CosmicMicroWaveNoise {
  private noise3D: ReturnType<typeof createNoise3D>;
  forceField: number[][];
  height: number;
  width: number;
  size: number;

  constructor(w: number, h: number, size: number, seed: number = Date.now()) {
    const prng = Alea(seed);
    this.noise3D = createNoise3D(prng);
    this.width = w;
    this.height = h;
    this.size = size;
    this.forceField = this.getField(w, h, size, 0);
  }
  
  update(time: number) {
    this.forceField = this.getField(this.width, this.height, this.size, time);
  }
  /**
   * Get a 2D force vector at a position
   * @param x - X position
   * @param y - Y position
   * @param scale - Noise scale (smaller = smoother, larger = more chaotic)
   * @param strength - Force magnitude multiplier
   * @param time - Time parameter for animation
   * @returns {x, y} force vector
   */
  getForceAt2D(
    x: number,
    y: number,
    scale: number,
    strength: number,
    time: number
  ): Vector2 {
    // Sample noise at two different offsets to get independent x and y components
    const forceX = this.noise3D(x * scale, y * scale, time) * strength;
    const forceY = this.noise3D(x * scale + 1000, y * scale + 1000, time) * strength;
    
    const force = new Vector2(forceX, forceY);
    return force ;
  }
  
  /**
   * Alternative: Get force as angle-based vector (creates swirling patterns)
   */
  getForceAt2DSwirl(
    x: number,
    y: number,
    scale: number,
    strength: number,
    time: number
  ): Vector2 {
    // Use noise to determine angle
    const angle = this.noise3D(x * scale, y * scale, time) * Math.PI * 2;
    
    const force = new Vector2(
      Math.cos(angle) * strength,
      Math.sin(angle) * strength 
    );
    return force
  }
  
  /**
   * Get curl noise (divergence-free, creates realistic fluid flow)
   */
  getForceAt2DCurl(
    x: number,
    y: number,
    scale: number,
    strength: number,
    time: number,
    epsilon: number = 0.01
  ): Vector2 {
    // Sample noise at nearby points to compute curl
    const n1 = this.noise3D(x * scale, (y + epsilon) * scale, time);
    const n2 = this.noise3D(x * scale, (y - epsilon) * scale, time);
    const n3 = this.noise3D((x + epsilon) * scale, y * scale, time);
    const n4 = this.noise3D((x - epsilon) * scale, y * scale, time);
    
    // Curl is the perpendicular gradient
    const force = new Vector2(
      (n1 - n2) / (2 * epsilon) * strength,
      -(n3 - n4) / (2 * epsilon) * strength
    ) 
    return force;
  }
/**
   * Generate a 2D grid of noise values with custom pixel size
   * @param width - Total width in pixels
   * @param height - Total height in pixels
   * @param pixelSize - Size of each grid cell (e.g., 10 = one value per 10x10 pixels)
   * @param scale - Noise scale
   * @param time - Time parameter for animation
   * @param offsetX - X offset in world space (default: 0)
   * @param offsetY - Y offset in world space (default: 0)
   * @param normalize - If true, remap from [-1,1] to [0,1] (default: true)
   * @returns 2D array of noise values [y][x]
   */
  getField(
    width: number,
    height: number,
    pixelSize: number,
    time: number,
    scale: number = 0.005,
    offsetX: number = 0,
    offsetY: number = 0,
    normalize: boolean = true
  ): number[][] {
    // Calculate grid dimensions
    const gridWidth = Math.ceil(width / pixelSize);
    const gridHeight = Math.ceil(height / pixelSize);
    
    const field: number[][] = [];
    
    for (let gridY = 0; gridY < gridHeight; gridY++) {
      const row: number[] = [];
      
      for (let gridX = 0; gridX < gridWidth; gridX++) {
        // Convert grid coordinates to world coordinates
        const worldX = (gridX * pixelSize + offsetX) * scale;
        const worldY = (gridY * pixelSize + offsetY) * scale;
        
        let value = this.noise3D(worldX, worldY, time);
        
        // Optionally normalize from [-1, 1] to [0, 1]
        if (normalize) {
          value = (value + 1) / 2;
        }
        
        row.push(value);
      }
      field.push(row);
    }
    
    return field;
  }

    getVectorAt(
    x: number,
    y: number,
    time: number,
    scale: number = 0.05,
    offsetX: number = 0,
    offsetY: number = 0
  ): Vector2 {
    
    // Sample the noise
    const value = (this.noise3D(
      (x + offsetX) * scale,
      (y + offsetY) * scale,
      time
    ) + 1) / 2;  // normalize to [0,1]

    // Convert noise value -> angle
    const angle = value * Math.PI * 2; // 0..2π

    // Unit vector from angle
    const force = new Vector2(Math.cos(angle), Math.sin(angle));
    return force;
  }
}
