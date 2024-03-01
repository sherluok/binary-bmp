import { Bitmap, BitmapInit, Bits, CanvasLike } from './bitmap';

/** @deprecated Use {@link Bits.BINARY} instead. */
export const BINARY = Bits.BINARY;

/** @deprecated Use {@link Bits.VGA} instead. */
export const VGA = Bits.VGA;

/** @deprecated Use {@link Bits.GREY} instead. */
export const GREY = Bits.GREY;

/** @deprecated Use {@link Bits.RGB} instead. */
export const RGB = Bits.RGB;

/** @deprecated Use {@link Bits.RGBA} instead. */
export const RGBA = Bits.RGBA;

/**
 * @deprecated
 * Use {@link Bitmap.uint8Array} instead:
 * ```typescript
 * const uint8Array = new Bitmap(options).uint8Array();
 * ```
 */
export function make(options: BitmapInit): Uint8Array {
  return new Bitmap(options).uint8Array();
}

/**
 * @deprecated
 * Use {@link Bitmap.fromCanvas} instead:
 * ```typescript
 * const uint8Array = Bitmap.fromCanvas(canvas).bits(targetBits).uint8Array();
 * ```
 */
export function fromCanvas(targetBits: Bits, canvas: CanvasLike): Uint8Array {
  return Bitmap.fromCanvas(canvas).bits(targetBits).uint8Array();
}
