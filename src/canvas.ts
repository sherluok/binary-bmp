import { BINARY, RGBA, GREY } from './bits';
import { make } from './bmp';

const pattern = [
  [0, 128, 32, 160, 8, 136, 40, 168],
  [192, 64, 224, 96, 200, 72, 232, 104],
  [48, 176, 16, 144, 56, 184, 24, 152],
  [240, 112, 208, 80, 248, 120, 216, 88],
  [12, 140, 44, 172, 4, 132, 36, 164],
  [204, 76, 236, 108, 196, 68, 228, 100],
  [60, 188, 28, 156, 52, 180, 20, 148],
  [252, 124, 220, 92, 244, 116, 212, 8],
];

interface ICanvasLike {
  width: number;
	height: number;
  getContext(contextId: '2d'): {
    getImageData(sx: number, sy: number, sw: number, sh: number): {
      readonly width: number;
      readonly height: number;
      readonly data: Uint8ClampedArray;
    };
  };
}

export function fromCanvas(bits: number, canvas: ICanvasLike) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imageData;

  if (bits === GREY || bits === BINARY) {
    const uint8 = new Uint8ClampedArray(width * height);
    for (let i = 0; i < uint8.length; i += 1) {
      const r = data[i * 4 + 0];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const grey = 0.299 * r + 0.587 * g + 0.114 * b;
      if (bits === GREY) {
        uint8[i] = grey;
      } else {
        const x = i % width;
        const y = Math.floor(i / width);
        uint8[i] = grey > pattern[x % 8][y % 8] ? 1 : 0;
      }
    }
    return make({ bits, width, height, data: uint8 });
  } else if (bits === RGBA) {
    return make({ bits, width, height, data });
  } else {
    throw new Error(`Support 1 or 8 or 32 bits color only, recieved [${bits}]`);
  }
}
