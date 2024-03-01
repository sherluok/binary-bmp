const PATTERN = [
  [0x00, 0x80, 0x20, 0xA0, 0x08, 0x88, 0x28, 0xA8],
  [0xC0, 0x40, 0xE0, 0x60, 0xC8, 0x48, 0xE8, 0x68],
  [0x30, 0xB0, 0x10, 0x90, 0x38, 0xB8, 0x18, 0x98],
  [0xF0, 0x70, 0xD0, 0x50, 0xF8, 0x78, 0xD8, 0x58],
  [0x0C, 0x8C, 0x2C, 0xAC, 0x04, 0x84, 0x24, 0xA4],
  [0xCC, 0x4C, 0xEC, 0x6C, 0xC4, 0x44, 0xE4, 0x64],
  [0x3C, 0xBC, 0x1C, 0x9C, 0x34, 0xB4, 0x14, 0x94],
  [0xFC, 0x7C, 0xDC, 0x5C, 0xF4, 0x74, 0xD4, 0x08],
];

export class RGBA {
  static WHITE = new RGBA(255, 255, 255, 255);

  static from(init: string): RGBA {
    const s = init.replace(/^#/, '');
    const R = parseInt(s.slice(0, 2), 16);
    const G = parseInt(s.slice(2, 4), 16);
    const B = parseInt(s.slice(4, 6), 16);
    const A = parseInt(s.slice(6, 8).padEnd(2, 'F'), 16);
    return new RGBA(R, G, B, A);
  }

  constructor(
    public R: number,
    public G: number,
    public B: number,
    public A: number,
  ) {}

  * [Symbol.iterator](): Generator<number> {
    yield this.R;
    yield this.G;
    yield this.B;
    yield this.A;
  }

  valueOf(): number {
    const [R, G, B, A] = this;
    return (R << 24 >>> 0) + (G << 16) + (B << 8) + A;
  }

  toGrey(): number {
    const [R, G, B] = this;
    return 0.299 * R + 0.587 * G + 0.114 * B;
  }

  toBinary(x: number, y: number): 0 | 1 {
    return this.toGrey() > PATTERN[x % 8][y % 8] ? 1 : 0;
  }

  toBGRA(): RGBA {
    const [R, G, B, A] = this;
    return new RGBA(B, G, R, A);
  }

  blend(background: RGBA): RGBA {
    const a = this.A / 255;
    return new RGBA(
      (this.R * a) + (background.R * (1 - a)),
      (this.G * a) + (background.G * (1 - a)),
      (this.B * a) + (background.B * (1 - a)),
      255,
    );
  }
}
