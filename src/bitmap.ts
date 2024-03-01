/**
 * BMP位图文件格式
 * https://en.wikipedia.org/wiki/BMP_file_format
 *
 * 位图文件由文件头、信息头、颜色表、像素数据组成。
 * 分为1位单色位图、4位VGA位图、8位灰度位图、24位RGB位图、32位RGBA位图几种。
 *
 * ## 颜色表
 *
 * 只有1,4,8位色彩才需要颜色表, 24,32位真彩色无颜色表;
 * 颜色表中最多有2^n个颜色, 即1,4,8位色彩分别有2,16,256个, 少于2^n时剩余的颜色会显示为黑色;
 * 每个颜色由4字节的BGRA组成, 在不支持Alpha透明度通道的标准中最后一字节固定为0x00;
 *
 * ## 像素数据
 *
 * 像素数据记录了位图的每一个像素。
 * 1位色彩每8个像素占1个字节;
 * 4位色彩每2个像素占1个字节;
 * 8位色彩每1个像素占1个字节;
 * 24位色彩每1个像素占3个字节, 按B,G,R顺序组成;
 * 32位色彩每1个像素占4个字节, 按B,G,R,A顺序组成;
 * 记录顺序在扫描列之间是从下到上, 记录顺序在扫描行内是从左到右;
 * 一个扫描行所占的字节数必须是4的倍数, 不足的以0填充;
 */

import { SequentialWriter } from './buffer';
import { RGBA } from './color';
import { range } from './iterator';

/** 位图颜色位值 */
export enum Bits {
  /** 单色 */
  BINARY = 1,
  /** 16 色 */
  VGA = 4,
  /** 256 色 */
  GREY = 8,
  /** 高彩色 */
  RGB = 24,
  /** 真彩色 */
  RGBA = 32,
}

export interface PixelData {
  [index: number]: number;
}

export interface ImageData {
  readonly width: number;
  readonly height: number;
  readonly data: PixelData;
}

export interface CanvasLike {
  width: number;
	height: number;
  getContext(contextId: '2d'): {
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
  };
}

export interface BitmapInit {
  bits: Bits;
  width: number;
  height: number;
  data: PixelData;
  palette?: string[];
  bgr?: boolean;
  flip?: boolean;
  background?: RGBA;
}

export class Bitmap {
  /**
   * 从 Canvas 对象创建位图对象
   * @param canvas [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) 或 [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) 或 [node-canvas](https://github.com/Automattic/node-canvas) 等符合 Canvas 接口的对象
   * @returns 位图对象
   */
  static fromCanvas(canvas: CanvasLike): Bitmap {
    const ctx = canvas.getContext('2d');
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return new Bitmap({
      bits: Bits.RGBA,
      width: image.width,
      height: image.height,
      data: image.data,
    });
  }

  /**
   * 从位图文件数据创建位图对象
   * @param buffer 位图文件数据
   * @example 位图对象
   * ```typescript
   * fetch('./some.bmp').then(async (res) => {
   *   const buffer = await res.arrayBuffer();
   *   const bitmap = Bitmap.fromBuffer(buffer);
   * });
   * ```
   */
  static fromBuffer(buffer: ArrayBuffer | Uint8Array) {
    const arrayBuffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
    const view = new DataView(arrayBuffer);

    // 文件头(BITMAPFILEHEADER)
    console.log(view.getUint16(0), 0x424D);         // 1-2字节; 文件的类型; The header field used to identify the BMP and DIB file is 0x42 0x4D in hexadecimal, same as BM in ASCII.
    console.log(view.getUint32(2, true), 'fileSize'); // 3-6字节; 文件的大小; The size of the BMP file in bytes.
    console.log(view.getUint32(10, true), 'startAt');  // 11-14字节; 像素数据的起始位置; The offset, i.e. starting address, of the byte where the bitmap image data (pixel array) can be found.

    // 信息头(BITMAPINFOHEADER)
    console.log(view.getUint32(14, true), 40);       // 15-18字节; 本结构所占用字节数;the size of this header (40 bytes).
    console.log(view.getUint32(18, true), 'width');    // 19-22字节; 宽度, 水平方向的像素个数; the bitmap width in pixels (signed integer).
    console.log(view.getUint32(22, true), 'height');   // 23-26字节; 高度, 垂直方向的像素个数; the bitmap height in pixels (signed integer).
    console.log(view.getUint16(26, true), 1);        // 27-28字节; 目标设备的级别, 必须为1; the number of color planes (must be 1).
    console.log(view.getUint16(28, true), 'bits');     // 29-30字节; 每个像素占用的位数; the number of bits per pixel, which is the color depth of the image. Typical values are 1, 4, 8, 16, 24 and 32.
    console.log(view.getUint32(30, true), '');        // 31-34字节; 位图压缩类型, 必须是0(不压缩), 1(BI_RLE8压缩类型)或2(BI_RLE4压缩类型)之一; the compression method being used. See the next table for a list of possible values.
    console.log(view.getUint32(34, true), 'rawSize');  // 35-38字节; the image size. This is the size of the raw bitmap data; a dummy 0 can be given for BI_RGB bitmaps.
    console.log(view.getUint32(38, true), 0);        // 39-42字节; 位图水平分辨率, 每米像素数, 在设备无关位图中为0; the horizontal resolution of the image. (pixel per meter, signed integer).
    console.log(view.getUint32(42, true), 0);        // 43-46字节; 位图垂直分辨率, 每米像素数, 在设备无关位图中为0; the vertical resolution of the image. (pixel per meter, signed integer).
    console.log(view.getUint32(46, true), 0);        // 47-50字节; 位图实际使用的颜色表中的颜色数, 设为0表示2的n次方; the number of colors in the color palette, or 0 to default to 2n.
    console.log(view.getUint32(50, true), 0);        // 51-54字节; 位图显示过程中重要的颜色数, 一般忽略，设为0; the number of important colors used, or 0 when every color is important; generally ignored.
  }

  #bits: Bits;
  #width: number;
  #height: number;
  #palette: string[];
  #data: PixelData;
  #bgrMode: boolean;
  #verticalFlip: boolean;
  #background: RGBA;

  constructor(init: BitmapInit) {
    this.#bits = init.bits;
    this.#width = init.width;
    this.#height = init.height;
    this.#data = init.data;
    this.#palette = init.palette ?? [];
    this.#bgrMode = init.bgr ?? false;
    this.#verticalFlip = init.flip ?? false;
    this.#background = init.background ?? RGBA.WHITE;
  }

  /** 垂直镜像翻转 */
  flip(): this {
    this.#verticalFlip = !this.#verticalFlip;
    return this;
  }

  /** 读取位图宽度 */
  width(): number;

  /** 等比缩放位图宽度至指定值 */
  width(to: number): Bitmap;

  width(to?: number): unknown {
    return this.#width;
  }

  /** 读取位图宽度 */
  height(): number;

  /** 等比缩放位图宽度至指定值 */
  height(to: number): Bitmap;

  height(to?: number): unknown {
    return this.#height;
  }

  /** 读取像素数据 */
  data(): Uint8ClampedArray;

  /** 读取一个像素数据 */
  data(x: number, y: number): number;

  data(x?: number, y?: number): unknown {
    return this.#data;
  }

  /** 设置背景色，用于与透明度通道混合。 */
  background(value: string) {
    this.#background = RGBA.from(value);
    return this;
  }

  /** 读取位图颜色位值 */
  bits(): Bits;

  /** 转换位图颜色位值 */
  bits(target: Bits): Bitmap;

  bits(target?: Bits): unknown {
    if (target === undefined) {
      return this.#bits;
    }

    if (this.#bits !== Bits.RGBA) {
      throw new Error(`Currently only supports convert from RGBA to others!`);
    }

    const width = this.#width;
    const height = this.#height;
    const data = this.#data;

    switch (target) {
      case Bits.BINARY:
      case Bits.GREY:
      case Bits.VGA: {
        const uint8 = new Uint8ClampedArray(width * height);
        for (let i = 0; i < uint8.length; i += 1) {
          const pixel = new RGBA(
            data[i * 4 + 0],
            data[i * 4 + 1],
            data[i * 4 + 2],
            data[i * 4 + 3],
          ).blend(this.#background);
          if (target === Bits.GREY) {
            uint8[i] = pixel.toGrey();
          } else if (target === Bits.VGA) {
            uint8[i] = Math.floor(pixel.toGrey() / 16);
          } else {
            const x = i % width;
            const y = Math.floor(i / width);
            uint8[i] = pixel.toBinary(x, y);
          }
        }
        return new Bitmap({
          bits: target,
          width,
          height,
          data: uint8,
          flip: this.#verticalFlip,
        });
      }
      case Bits.RGB: {
        const uint8 = new Uint8ClampedArray(width * height * 3);
        for (let i = 0; i < width * height * 4; i += 4) {
          const pixel = new RGBA(
            data[i + 0],
            data[i + 1],
            data[i + 2],
            data[i + 3],
          ).blend(this.#background);
          uint8[((i / 4) * 3) + 0] = pixel.R;
          uint8[((i / 4) * 3) + 1] = pixel.G;
          uint8[((i / 4) * 3) + 2] = pixel.B;
        }
        return new Bitmap({
          bits: target,
          width,
          height,
          data: uint8,
          flip: this.#verticalFlip,
          bgr: this.#bgrMode,
        });
      }
      case Bits.RGBA: {
        return this;
      }
      default: {
        throw new Error(`Unknown target color bits: ${target}!`);
      }
    }
  }

  /** 生成位图文件数据 */
  arrayBuffer(): ArrayBuffer {
    const bits = this.#bits;
    const width = this.#width;
    const height = this.#height;
    const palette = this.#palette;
    const data = this.#data;

    /** 颜色表大小(字节) */
    const colorTableSize = bits > Bits.GREY ? 0 : (palette?.length || (1 << bits)) * 4;
    const imageRowSize = Math.floor((bits * width + 31) / 32) * 4;
    const imageColSize = Math.abs(height);
    /** 像素数据大小(字节) */
    const rawSize = imageRowSize * imageColSize;
    /** 像素数据的起始位置(字节) */
    const startAt = 54 + colorTableSize;
    /** 文件的大小(字节) */
    const fileSize = startAt + rawSize;

    /** 位图文件 */
    const arryBuffer = new ArrayBuffer(fileSize);
    const view = new SequentialWriter(arryBuffer);

    // 文件头(BITMAPFILEHEADER)
    view.appendUint16(0x424D);         // 1-2字节; 文件的类型; The header field used to identify the BMP and DIB file is 0x42 0x4D in hexadecimal, same as BM in ASCII.
    view.appendUint32(fileSize, true); // 3-6字节; 文件的大小; The size of the BMP file in bytes.
    view.appendUint16(0, true);        // 6-8字节; 保留字; Reserved; actual value depends on the application that creates the image, if created manually can be 0.
    view.appendUint16(0, true);        // 8-10字节; 保留字; Reserved; actual value depends on the application that creates the image, if created manually can be 0.
    view.appendUint32(startAt, true);  // 11-14字节; 像素数据的起始位置; The offset, i.e. starting address, of the byte where the bitmap image data (pixel array) can be found.

    // 信息头(BITMAPINFOHEADER)
    view.appendUint32(40, true);       // 15-18字节; 本结构所占用字节数;the size of this header (40 bytes).
    view.appendUint32(width, true);    // 19-22字节; 宽度, 水平方向的像素个数; the bitmap width in pixels (signed integer).
    view.appendUint32(height, true);   // 23-26字节; 高度, 垂直方向的像素个数; the bitmap height in pixels (signed integer).
    view.appendUint16(1, true);        // 27-28字节; 目标设备的级别, 必须为1; the number of color planes (must be 1).
    view.appendUint16(bits, true);     // 29-30字节; 每个像素占用的位数; the number of bits per pixel, which is the color depth of the image. Typical values are 1, 4, 8, 16, 24 and 32.
    view.appendUint32(0, true);        // 31-34字节; 位图压缩类型, 必须是0(不压缩), 1(BI_RLE8压缩类型)或2(BI_RLE4压缩类型)之一; the compression method being used. See the next table for a list of possible values.
    view.appendUint32(rawSize, true);  // 35-38字节; the image size. This is the size of the raw bitmap data; a dummy 0 can be given for BI_RGB bitmaps.
    view.appendUint32(0, true);        // 39-42字节; 位图水平分辨率, 每米像素数, 在设备无关位图中为0; the horizontal resolution of the image. (pixel per meter, signed integer).
    view.appendUint32(0, true);        // 43-46字节; 位图垂直分辨率, 每米像素数, 在设备无关位图中为0; the vertical resolution of the image. (pixel per meter, signed integer).
    view.appendUint32(0, true);        // 47-50字节; 位图实际使用的颜色表中的颜色数, 设为0表示2的n次方; the number of colors in the color palette, or 0 to default to 2n.
    view.appendUint32(0, true);        // 51-54字节; 位图显示过程中重要的颜色数, 一般忽略，设为0; the number of important colors used, or 0 when every color is important; generally ignored.

    // 颜色表(COLORTABLE)
    if (bits <= Bits.GREY) {
      if (palette.length > 0) {
        for (const color of palette) {
          view.appendUint32(+RGBA.from(color).toBGRA());
        }
      } else {
        // 构造默认灰度颜色表
        const step = 0xFF / ((1 << bits) - 1); // (2^8 - 1) / (2^n - 1): 255, 17, 1
        for (let i = 0; i < 256; i += step) {
          view.appendUint32((i << 24) + (i << 16) + (i << 8)); // 2^24(B) + 2^16(G) + 2^8(R) + 2^1(QUAD)*0
        }
      }
    }

    // 位图数据(PIXELSTORAGE)
    const bitsPerDataItem = Math.min(8, bits); // 传入的数组中每个元素应该占的位数; 1,4,8,24,32位色彩分别对应1,4,8,8,8
    const bytesPerRow = width * Math.ceil(bits / 8); // 位图数据每行所占字节数; 1,4,8,24,32位色彩分别对应width*(1,1,1,3,4)
    // 记录顺序在扫描列之间是从下到上
    const cols = this.#verticalFlip ? range(0, height - 1) : range(height - 1, 0);
    for (const [y] of cols) {
      let uint32 = 0;
      let offset = 0;
      // 记录顺序在扫描行内是从左到右
      for (let x = 0; x < bytesPerRow; x += 1) {
        let indexOfDataItem = y * bytesPerRow + x;
        // 真彩色需的存储顺序为BGRA
        if (bits > Bits.GREY) {
          const bytesPerPixel = bits / 8;
          const pixelOffset = indexOfDataItem % bytesPerPixel;
          switch (pixelOffset) {
            case 0: indexOfDataItem += 2; break; // B -> R
            case 2: indexOfDataItem -= 2; break; // R -> B
            default: break;
          }
        }
        uint32 <<= bitsPerDataItem;
        uint32 += data[indexOfDataItem];
        offset += bitsPerDataItem;
        if (offset === 32) {
          view.appendUint32(uint32);
          uint32 = 0;
          offset = 0;
        } else if (x === bytesPerRow - 1) {
          // 一个扫描行所占的字节数必须是4的倍数, 不足的以0填充
          uint32 <<= 32 - offset;
          view.appendUint32(uint32);
          uint32 = 0;
          offset = 0;
        }
      }
    }

    return arryBuffer;
  }

  uint8Array(): Uint8Array {
    return new Uint8Array(this.arrayBuffer());
  }

  blob(): Blob {
    return new Blob([this.arrayBuffer()], { type: 'image/bmp' });
  }
}
