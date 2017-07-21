const base64js = require('base64-js');
const pattern = [
  [ 0, 128, 32, 160, 8, 136, 40, 168 ],
  [ 192, 64, 224, 96, 200, 72, 232, 104 ],
  [ 48, 176, 16, 144, 56, 184, 24, 152 ],
  [ 240, 112, 208, 80, 248, 120, 216, 88 ],
  [ 12, 140, 44, 172, 4, 132, 36, 164 ],
  [ 204, 76, 236, 108, 196, 68, 228, 100 ],
  [ 60, 188, 28, 156, 52, 180, 20, 148 ],
  [ 252, 124, 220, 92, 244, 116, 212, 8 ],
];

// https://en.wikipedia.org/wiki/BMP_file_format
class Bmp {
  // 5种位图的名称对应的颜色位值
  static BINARY = 1;
  static VGA = 4;
  static GREY = 8;
  static RGB = 24;
  static RGBA = 32;

  // 创建一个包含指定范围的元素的数组
  static range(start, end) {
    const output = [];
    if (start < end) for (let i = start; i < end; i++) output.push(i);
    if (start > end) for (let i = start - 1; i >= end; i--) output.push(i);
    return output;
  }

  // 颜色字符串转32位二进制数
  static bgr2bin(bgrString) {
    return parseInt(bgrString.padEnd(8, '0'), 16);
  }
  static rgb2bgr(rgbString) {
    const r = rgbString.substr(0, 2);
    const g = rgbString.substr(2, 2);
    const b = rgbString.substr(4, 2);
    const a = rgbString.substr(6, 2) || '00';
    return Bmp.bgr2bin(b + g + r + a);
  }

  // canvas元素转imageData
  static canvas2imageData(bitsPerPixel, canvas) {
    if (typeof canvas.getContext !== 'function') {
      // 传入的参数不是canvas
      return canvas;
    } else {
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      if (bitsPerPixel === 32) {
        // RGBA图
        return imageData;
      } else {
        const { width, height } = imageData;
        const pixels = width * height;
        const data = new Uint8Array(pixels);
        if (bitsPerPixel === 8 || bitsPerPixel === 1) {
          for (let i = 0; i < pixels; i++) {
            const r = imageData.data[i * 4 + 0];
            const g = imageData.data[i * 4 + 1];
            const b = imageData.data[i * 4 + 2];
            const grey = 0.299 * r + 0.587 * g + 0.114 * b;
            if (bitsPerPixel === 8) {
              // 灰度图
              data[i] = grey;
            } else {
              // 单色图
              const x = i % width;
              const y = Math.floor(i / width);
              const bin = grey > pattern[x % 8][y % 8] ? 1 : 0;
              data[i] = bin;
            }
          }
        }
        return { width, height, data };
      }
    }
  }

  isBGRMode = false;
  isVerticalFlip = false;

  flag = 0x424d; //位图文件的类型，必须为BM(1-2字节）
  reserved = 0; //位图文件保留字，必须为0(7-8字节），必须为0(9-10字节）
  headerInfoSize = 40; //本结构所占用字节数（15-18字节）
  colorPlanes = 1; //目标设备的级别，必须为1(27-28字节）
  compression = 0; //位图压缩类型，必须是0（不压缩），1(BI_RLE8压缩类型）或2(BI_RLE4压缩类型）之一（31-34字节）
  horizontalResolution = 0; //位图水平分辨率，每米像素数，在设备无关位图中为0（39-42字节）
  verticalResolution = 0; //位图垂直分辨率，每米像素数，在设备无关位图中为0（43-46字节)
  colorsInColorPalette = 0; //位图实际使用的颜色表中的颜色数，不用，固定为0（47-50字节）
  importantColorsUsed = 0; //位图显示过程中重要的颜色数，不用，固定为0（51-54字节）

  constructor(bitsPerPixel, canvas) {
    this.bitsPerPixel = bitsPerPixel; //每个像素所需的位数，必须是1（双色），4(16色），8(256色）16(高彩色)或24（真彩色）之一（29-30字节）
    const { width, height, data } = Bmp.canvas2imageData(bitsPerPixel, canvas);
    this.widthInPixels = width; //位图的宽度，以像素为单位（19-22字节）
    this.heightInPixels = height; //位图的高度，以像素为单位（23-26字节）
    this.data = data;
  }

  // 生成位图文件
  make() {
    this.colorTableSize = this.bitsPerPixel <= 8 ? 4 * Math.pow(2, this.bitsPerPixel) : 0;
    this.offset = 54 + this.colorTableSize; //位图数据的起始位置，以相对于位图（11-14字节，低位在前）
    this.rawDataRowSize = Math.floor((this.bitsPerPixel * this.widthInPixels + 31) / 32) * 4;
    this.rawDataColSize = Math.abs(this.heightInPixels);
    this.rawDataSize =  this.rawDataRowSize * this.rawDataColSize; //位图的大小(其中包含了为了补齐行数是4的倍数而添加的空字节)，以字节为单位（35-38字节）
    this.fileSize = this.offset + this.rawDataSize; //位图文件的大小，以字节为单位（3-6字节，低位在前）
    // 清空数据
    this.buffer = new ArrayBuffer(this.fileSize);
    this.view = new DataView(this.buffer);
    // 从头开始
    this.viewByteOffset = 0;
    this.setBitmapFileHeader();
    this.setBitmapInformationHeader();
    if (this.colorTableSize) {
      // 只有颜色位数为1,4,8时才有颜色表
      this.setColorTable();
    }
    this.setPixelStorage();
    this.viewByteOffset = 0;
  }

  // BMP文件头
  setBitmapFileHeader() {
    this.setUint16(this.flag); //The header field used to identify the BMP and DIB file is 0x42 0x4D in hexadecimal, same as BM in ASCII.
    this.setUint32(this.fileSize, true); //The size of the BMP file in bytes
    this.setUint32(this.reserved, true); //Reserved; actual value depends on the application that creates the image
    this.setUint32(this.offset, true); //The offset, i.e. starting address, of the byte where the bitmap image data (pixel array) can be found.
  }

  // 位图信息头
  setBitmapInformationHeader() {
    this.setUint32(this.headerInfoSize, true); //the size of this header (40 bytes)
    this.setUint32(this.widthInPixels, true); //the bitmap width in pixels (signed integer)
    this.setUint32(this.heightInPixels, true); //the bitmap height in pixels (signed integer)
    this.setUint16(this.colorPlanes, true); //the number of color planes (must be 1)
    this.setUint16(this.bitsPerPixel, true); //the number of bits per pixel, which is the color depth of the image. Typical values are 1, 4, 8, 16, 24 and 32.
    this.setUint32(this.compression, true); //the compression method being used. See the next table for a list of possible values
    this.setUint32(this.rawDataSize, true); //the image size. This is the size of the raw bitmap data; a dummy 0 can be given for BI_RGB bitmaps.
    this.setUint32(this.horizontalResolution, true); //the horizontal resolution of the image. (pixel per meter, signed integer)
    this.setUint32(this.verticalResolution, true); //the vertical resolution of the image. (pixel per meter, signed integer)
    this.setUint32(this.colorsInColorPalette, true); //the number of colors in the color palette, or 0 to default to 2n
    this.setUint32(this.importantColorsUsed, true); //the number of important colors used, or 0 when every color is important; generally ignored
  }

  // 颜色表
  // 只有颜色位数为1,4,8时才有颜色表
  // http://blog.csdn.net/l1259863243/article/details/52290964
  setColorTable() {
    if (this.colorTableSize) {
      if (Array.isArray(this.palette)) {
        // 自定义颜色表
        for (let color of this.palette) {
          this.setUint32(Bmp.rgb2bgr(color));
        }
      } else {
        // 默认的颜色表是变化的灰度
        const step = 255 / ((1<<this.bitsPerPixel) - 1); // (2^8 - 1)/(2^n - 1): 255, 17, 1
        const grey = 16843008; // 2^24 + 2^16 + 2^8 + 2^0
        for (let i = 0; i < 256; i += step) {
          this.setUint32(i * grey); // R*2^24 + G*2^16 + B*2^8 + A*2^0
          // console.log((i * grey).toString(16));
        }
      }
    }
  }

  // 位图数据
  setPixelStorage() {
    const col = this.isVerticalFlip ? Bmp.range(0, this.heightInPixels) : Bmp.range(this.heightInPixels, 0);
    const row = Bmp.range(0, this.widthInPixels * (this.colorTableSize ? 1 : this.bitsPerPixel / 8));
    const dataArrayItemBits = Math.min(8, this.bitsPerPixel); //传入的数组中每个元素应该占的位数; 1,4,8,24,32分别对应1,4,8,8,8
    col.forEach((y) => {
      let int32 = 0;
      let count = 0;
      row.forEach((x, index) => {
        let dataArrayItemIndex = y * row.length + x;
        // 1,4,8位不是真彩色, 位图格式的默认顺序是BGR
        if (!this.colorTableSize && !this.isBGRMode) {
          const pixelOffset = dataArrayItemIndex % (this.bitsPerPixel / 8);
          // R <-> B (RGB <-> BGR, RGBA <-> BGRA)
          switch (pixelOffset) {
            case 0: dataArrayItemIndex += 2; break;
            case 2: dataArrayItemIndex -= 2; break;
            default: break;
          }
        }
        int32 <<= dataArrayItemBits;
        int32 += this.data[dataArrayItemIndex];
        count += dataArrayItemBits;
        if (count === 32) {
          this.setUint32(int32);
          int32 = 0;
          count = 0;
        } else if (index === row.length - 1) {
          int32 <<= 32 - count;
          this.setUint32(int32);
          int32 = 0;
          count = 0;
        }
      });
    });
  }

  // 依次将数据写入内存
  // 按先后顺序写入，无需每次记录写入位置
  viewSetter(methodName, byteLength, value, littleEndian) {
    this.view[methodName](this.viewByteOffset, value, littleEndian);
    this.viewByteOffset += byteLength;
  }
  get setInt8() { return this.viewSetter.bind(this, 'setInt8', 1); }
  get setUint8() { return this.viewSetter.bind(this, 'setUint8', 1); }
  get setInt16() { return this.viewSetter.bind(this, 'setInt16', 2); }
  get setUint16() { return this.viewSetter.bind(this, 'setUint16', 2); }
  get setInt32() { return this.viewSetter.bind(this, 'setInt32', 4); }
  get setUint32() { return this.viewSetter.bind(this, 'setUint32', 4); }
  get setFloat32() { return this.viewSetter.bind(this, 'setFloat32', 4); }
  get setFloat64() { return this.viewSetter.bind(this, 'setFloat64', 8); }

  // 自定义颜色表（调色板）
  setPalette(palette) {
    this.palette = palette;
    return this;
  }

  // 数据是按rgb顺序排列
  rgb() {
    this.isBGRMode = false;
    return this;
  }
  // 数据是按BGR顺序排列
  bgr() {
    this.isBGRMode = true;
    return this;
  }

  // 镜像翻转
  flip() {
    this.isVerticalFlip = !this.isVerticalFlip;
    return this;
  }

  // 返回Uint8Array格式数据
  getBuffer() {
    this.make();
    return new Uint8Array(this.buffer);
  }

  // 返回base64格式的数据
  getBase64(withOutPrefix) {
    this.make();
    const prefix = withOutPrefix ? '' : 'data:image/bmp;base64,';
    const base64 = base64js.fromByteArray(new Uint8Array(this.buffer));
    return prefix + base64;
  }

  // 返回16进制的数据，方便调试
  getHex() {
    this.make();
    return Array.prototype.map.call(new Uint8Array(this.buffer), x => x.toString(16).padStart(2, '0')).join('');
  }
}

module.exports = Bmp;
