class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.mass = 0;
    this.size = 0;
    this.decay = 0;
    this.life = 0;
    this.gravity = -9.82;
    this.color = [1, 1, 1];
  }

  /**
     * @param {number} dt
     * @param {number} time
     */
  update(dt, time) {
    this.life -= dt;
    this.size -= dt * this.decay;

    // Physics calculations (matches main thread logic)
    const Cd = 0.47;
    const rho = 1.22;
    const A = Math.PI / 10000;

    let Fx = -0.5 * Cd * A * rho * this.vx * this.vx * this.vx / Math.abs(this.vx);
    let Fy = -0.5 * Cd * A * rho * this.vy * this.vy * this.vy / Math.abs(this.vy);
    let Fz = -0.5 * Cd * A * rho * this.vz * this.vz * this.vz / Math.abs(this.vz);

    Fx = isNaN(Fx) ? 0 : Fx;
    Fy = isNaN(Fy) ? 0 : Fy;
    Fz = isNaN(Fz) ? 0 : Fz;

    const ax = Fx / this.mass;
    const ay = this.gravity + (Fy / this.mass);
    const az = Fz / this.mass;

    this.vx += ax * dt;
    this.vy += ay * dt;
    this.vz += az * dt;

    this.x += this.vx * dt * 100;
    this.y += this.vy * dt * 100;
    this.z += this.vz * dt * 100;
  }
}

self.onmessage = function(e) {
  const {
    positions,
    colors,
    sizes,
    frameDelta,
    particlesCount,
    spawnCounter,
    spawnFramespan,
  } = e.data;

  const updatedPositions = new Float32Array(positions);
  const updatedColors = new Float32Array(colors);
  const updatedSizes = new Float32Array(sizes);
  let activeParticles = 0;
  const time = performance.now() * 0.001;

  // Process particles
  const particle = new Particle();
  for (let i = 0, posIdx = 0, colIdx = 0; i < particlesCount; i++) {
    posIdx = i * 3;
    colIdx = i * 3;

    particle.x = positions[posIdx];
    particle.y = positions[posIdx + 1];
    particle.z = positions[posIdx + 2];
    particle.color = [colors[colIdx], colors[colIdx + 1], colors[colIdx + 2]];
    particle.size = sizes[i];
    particle.mass = 1; // Default mass
    particle.decay = 10; // Default decay
    particle.life = 1; // Default life

    if (particle.size > 0 && particle.life > 0) {
      particle.update(frameDelta, time);
      activeParticles++;

      updatedPositions[posIdx] = particle.x;
      updatedPositions[posIdx + 1] = particle.y;
      updatedPositions[posIdx + 2] = particle.z;

      updatedColors[colIdx] = particle.color[0];
      updatedColors[colIdx + 1] = particle.color[1];
      updatedColors[colIdx + 2] = particle.color[2];

      updatedSizes[i] = particle.size;
    }
  }

  self.postMessage({
    positions: updatedPositions,
    colors: updatedColors,
    sizes: updatedSizes,
    frameDelta: frameDelta - (1 / 60),
    spawnCounter: spawnFramespan ? spawnCounter + 1 : 0,
    activeParticlesCount: activeParticles,
  }, [
    updatedPositions.buffer,
    updatedColors.buffer,
    updatedSizes.buffer,
  ]);
};
