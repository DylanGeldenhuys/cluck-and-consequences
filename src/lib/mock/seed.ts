export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  integer(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  choice<T>(array: T[]): T {
    return array[this.integer(0, array.length - 1)];
  }
}

export function createRNG(seed: string | number): SeededRNG {
  if (typeof seed === 'string') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    return new SeededRNG(Math.abs(hash));
  }
  return new SeededRNG(seed);
}
