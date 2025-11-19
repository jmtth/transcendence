// Perlin Noise implementation for force field generation
class PerlinNoise {
  constructor(seed = 0) {
    this.permutation = this.generatePermutation(seed);
    this.p = [...this.permutation, ...this.permutation];
  }

  generatePermutation(seed) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    
    // Shuffle using seed
    let random = seed;
    for (let i = 255; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    return p;
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Main noise function - returns value between -1 and 1
  noise(x, y, z) {
    // Find unit cube that contains point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    // Find relative x, y, z of point in cube
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    // Compute fade curves for each of x, y, z
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    // Hash coordinates of 8 cube corners
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    // Blend results from 8 corners of cube
    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }

  // Normalized noise - returns value between 0 and 1
  noise01(x, y, z) {
    return (this.noise(x, y, z) + 1) / 2;
  }

  // Octave noise for more detailed results
  octaveNoise(x, y, z, octaves = 4, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

// Create instance and export functions
const perlin = new PerlinNoise(12345);

// Simple function that returns Perlin noise value from x, y, z
export function getPerlinNoise(x, y, z) {
  return perlin.noise(x, y, z); // Returns value between -1 and 1
}

// Normalized version (0 to 1)
export function getPerlinNoise01(x, y, z) {
  return perlin.noise01(x, y, z);
}

// Multi-octave version for more detail
export function getPerlinNoiseOctave(x, y, z, octaves = 4) {
  return perlin.octaveNoise(x, y, z, octaves);
}

// Example usage for force field:
export function getForceField(x, y, z, scale = 0.1, strength = 10) {
  const noiseValue = perlin.octaveNoise(x * scale, y * scale, z * scale, 3);
  return {
    fx: noiseValue * strength,
    fy: perlin.octaveNoise(x * scale + 100, y * scale, z * scale, 3) * strength,
    fz: perlin.octaveNoise(x * scale, y * scale + 100, z * scale, 3) * strength
  };
}

// Usage examples:
// const value = getPerlinNoise(0.5, 1.2, 3.4);
// const normalized = getPerlinNoise01(0.5, 1.2, 3.4);
// const force = getForceField(x, y, z, 0.05, 15);
