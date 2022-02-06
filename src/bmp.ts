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

import { GREY } from './bits';
import { SequentialDataView } from './buffer';
import { rgba2bgra } from './color';

export interface IOption {
  bits: number,
  width: number,
  height: number,
  palette?: string[],
  data: Indexable<number>,
}

interface Indexable<T> {
  [index: number]: T;
}

/** 生成位图文件 */
export function make(options: IOption) {
  const { bits, width, height, palette, data } = options;
  /** 颜色表大小(字节) */
  const colorTableSize = bits > GREY ? 0 : (palette?.length || (1 << bits)) * 4;
  const imageRowSize = Math.floor((bits * width + 31) / 32) * 4;
  const imageColSize = Math.abs(height);
  /** 像素数据大小(字节) */
  const rawSize = imageRowSize * imageColSize;
  /** 像素数据的起始位置(字节) */
  const startAt = 54 + colorTableSize;
  /** 文件的大小(字节) */
  const fileSize = startAt + rawSize;

  /** 位图文件 */
  const buffer = new ArrayBuffer(fileSize);
  const view = new SequentialDataView(buffer);

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
  if (bits <= GREY) {
    if (Array.isArray(palette) && palette.length > 0) {
      for (const color of palette) {
        view.appendUint32(rgba2bgra(color));
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
  for (let y = height - 1; y >= 0; y -= 1) {
    let uint32 = 0;
    let offset = 0;
    // 记录顺序在扫描行内是从左到右
    for (let x = 0; x < bytesPerRow; x += 1) {
      let indexOfDataItem = y * bytesPerRow + x;
      // 真彩色需的存储顺序为BGRA
      if (bits > GREY) {
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
  return new Uint8Array(buffer);
}
