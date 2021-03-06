'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var base64js = require('base64-js');
var pattern = [[0, 128, 32, 160, 8, 136, 40, 168], [192, 64, 224, 96, 200, 72, 232, 104], [48, 176, 16, 144, 56, 184, 24, 152], [240, 112, 208, 80, 248, 120, 216, 88], [12, 140, 44, 172, 4, 132, 36, 164], [204, 76, 236, 108, 196, 68, 228, 100], [60, 188, 28, 156, 52, 180, 20, 148], [252, 124, 220, 92, 244, 116, 212, 8]];

// https://en.wikipedia.org/wiki/BMP_file_format

var Bmp = function () {
  _createClass(Bmp, null, [{
    key: 'range',


    // 创建一个包含指定范围的元素的数组
    value: function range(start, end) {
      var output = [];
      if (start < end) for (var i = start; i < end; i++) {
        output.push(i);
      }if (start > end) for (var _i = start - 1; _i >= end; _i--) {
        output.push(_i);
      }return output;
    }

    // 颜色字符串转32位二进制数

    // 5种位图的名称对应的颜色位值

  }, {
    key: 'bgr2bin',
    value: function bgr2bin(bgrString) {
      return parseInt(bgrString.padEnd(8, '0'), 16);
    }
  }, {
    key: 'rgb2bgr',
    value: function rgb2bgr(rgbString) {
      var r = rgbString.substr(0, 2);
      var g = rgbString.substr(2, 2);
      var b = rgbString.substr(4, 2);
      var a = rgbString.substr(6, 2) || '00';
      return Bmp.bgr2bin(b + g + r + a);
    }

    // canvas元素转imageData

  }, {
    key: 'canvas2imageData',
    value: function canvas2imageData(bitsPerPixel, canvas) {
      if (typeof canvas.getContext !== 'function') {
        // 传入的参数不是canvas
        return canvas;
      } else {
        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        if (bitsPerPixel === 32) {
          // RGBA图
          return imageData;
        } else {
          var width = imageData.width,
              height = imageData.height;

          var pixels = width * height;
          var data = new Uint8Array(pixels);
          if (bitsPerPixel === 8 || bitsPerPixel === 1) {
            for (var i = 0; i < pixels; i++) {
              var r = imageData.data[i * 4 + 0];
              var g = imageData.data[i * 4 + 1];
              var b = imageData.data[i * 4 + 2];
              var grey = 0.299 * r + 0.587 * g + 0.114 * b;
              if (bitsPerPixel === 8) {
                // 灰度图
                data[i] = grey;
              } else {
                // 单色图
                var x = i % width;
                var y = Math.floor(i / width);
                var bin = grey > pattern[x % 8][y % 8] ? 1 : 0;
                data[i] = bin;
              }
            }
          }
          return { width: width, height: height, data: data };
        }
      }
    } //位图文件的类型，必须为BM(1-2字节）
    //位图文件保留字，必须为0(7-8字节），必须为0(9-10字节）
    //本结构所占用字节数（15-18字节）
    //目标设备的级别，必须为1(27-28字节）
    //位图压缩类型，必须是0（不压缩），1(BI_RLE8压缩类型）或2(BI_RLE4压缩类型）之一（31-34字节）
    //位图水平分辨率，每米像素数，在设备无关位图中为0（39-42字节）
    //位图垂直分辨率，每米像素数，在设备无关位图中为0（43-46字节)
    //位图实际使用的颜色表中的颜色数，不用，固定为0（47-50字节）

  }]);

  //位图显示过程中重要的颜色数，不用，固定为0（51-54字节）

  function Bmp(bitsPerPixel, canvas) {
    _classCallCheck(this, Bmp);

    this.isBGRMode = false;
    this.isVerticalFlip = false;
    this.flag = 0x424d;
    this.reserved = 0;
    this.headerInfoSize = 40;
    this.colorPlanes = 1;
    this.compression = 0;
    this.horizontalResolution = 0;
    this.verticalResolution = 0;
    this.colorsInColorPalette = 0;
    this.importantColorsUsed = 0;

    this.bitsPerPixel = bitsPerPixel; //每个像素所需的位数，必须是1（双色），4(16色），8(256色）16(高彩色)或24（真彩色）之一（29-30字节）

    var _Bmp$canvas2imageData = Bmp.canvas2imageData(bitsPerPixel, canvas),
        width = _Bmp$canvas2imageData.width,
        height = _Bmp$canvas2imageData.height,
        data = _Bmp$canvas2imageData.data;

    this.widthInPixels = width; //位图的宽度，以像素为单位（19-22字节）
    this.heightInPixels = height; //位图的高度，以像素为单位（23-26字节）
    this.data = data;
  }

  // 生成位图文件


  _createClass(Bmp, [{
    key: 'make',
    value: function make() {
      this.colorTableSize = this.bitsPerPixel <= 8 ? 4 * Math.pow(2, this.bitsPerPixel) : 0;
      this.offset = 54 + this.colorTableSize; //位图数据的起始位置，以相对于位图（11-14字节，低位在前）
      this.rawDataRowSize = Math.floor((this.bitsPerPixel * this.widthInPixels + 31) / 32) * 4;
      this.rawDataColSize = Math.abs(this.heightInPixels);
      this.rawDataSize = this.rawDataRowSize * this.rawDataColSize; //位图的大小(其中包含了为了补齐行数是4的倍数而添加的空字节)，以字节为单位（35-38字节）
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

  }, {
    key: 'setBitmapFileHeader',
    value: function setBitmapFileHeader() {
      this.setUint16(this.flag); //The header field used to identify the BMP and DIB file is 0x42 0x4D in hexadecimal, same as BM in ASCII.
      this.setUint32(this.fileSize, true); //The size of the BMP file in bytes
      this.setUint32(this.reserved, true); //Reserved; actual value depends on the application that creates the image
      this.setUint32(this.offset, true); //The offset, i.e. starting address, of the byte where the bitmap image data (pixel array) can be found.
    }

    // 位图信息头

  }, {
    key: 'setBitmapInformationHeader',
    value: function setBitmapInformationHeader() {
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

  }, {
    key: 'setColorTable',
    value: function setColorTable() {
      if (this.colorTableSize) {
        if (Array.isArray(this.palette)) {
          // 自定义颜色表
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.palette[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var color = _step.value;

              this.setUint32(Bmp.rgb2bgr(color));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else {
          // 默认的颜色表是变化的灰度
          var step = 255 / ((1 << this.bitsPerPixel) - 1); // (2^8 - 1)/(2^n - 1): 255, 17, 1
          var grey = 16843008; // 2^24 + 2^16 + 2^8 + 2^0
          for (var i = 0; i < 256; i += step) {
            this.setUint32(i * grey); // R*2^24 + G*2^16 + B*2^8 + A*2^0
            // console.log((i * grey).toString(16));
          }
        }
      }
    }

    // 位图数据

  }, {
    key: 'setPixelStorage',
    value: function setPixelStorage() {
      var _this = this;

      var col = this.isVerticalFlip ? Bmp.range(0, this.heightInPixels) : Bmp.range(this.heightInPixels, 0);
      var row = Bmp.range(0, this.widthInPixels * (this.colorTableSize ? 1 : this.bitsPerPixel / 8));
      var dataArrayItemBits = Math.min(8, this.bitsPerPixel); //传入的数组中每个元素应该占的位数; 1,4,8,24,32分别对应1,4,8,8,8
      col.forEach(function (y) {
        var int32 = 0;
        var count = 0;
        row.forEach(function (x, index) {
          var dataArrayItemIndex = y * row.length + x;
          // 1,4,8位不是真彩色, 位图格式的默认顺序是BGR
          if (!_this.colorTableSize && !_this.isBGRMode) {
            var pixelOffset = dataArrayItemIndex % (_this.bitsPerPixel / 8);
            // R <-> B (RGB <-> BGR, RGBA <-> BGRA)
            switch (pixelOffset) {
              case 0:
                dataArrayItemIndex += 2;break;
              case 2:
                dataArrayItemIndex -= 2;break;
              default:
                break;
            }
          }
          int32 <<= dataArrayItemBits;
          int32 += _this.data[dataArrayItemIndex];
          count += dataArrayItemBits;
          if (count === 32) {
            _this.setUint32(int32);
            int32 = 0;
            count = 0;
          } else if (index === row.length - 1) {
            int32 <<= 32 - count;
            _this.setUint32(int32);
            int32 = 0;
            count = 0;
          }
        });
      });
    }

    // 依次将数据写入内存
    // 按先后顺序写入，无需每次记录写入位置

  }, {
    key: 'viewSetter',
    value: function viewSetter(methodName, byteLength, value, littleEndian) {
      this.view[methodName](this.viewByteOffset, value, littleEndian);
      this.viewByteOffset += byteLength;
    }
  }, {
    key: 'setPalette',


    // 自定义颜色表（调色板）
    value: function setPalette(palette) {
      this.palette = palette;
      return this;
    }

    // 数据是按rgb顺序排列

  }, {
    key: 'rgb',
    value: function rgb() {
      this.isBGRMode = false;
      return this;
    }
    // 数据是按BGR顺序排列

  }, {
    key: 'bgr',
    value: function bgr() {
      this.isBGRMode = true;
      return this;
    }

    // 镜像翻转

  }, {
    key: 'flip',
    value: function flip() {
      this.isVerticalFlip = !this.isVerticalFlip;
      return this;
    }

    // 返回Uint8Array格式数据

  }, {
    key: 'getBuffer',
    value: function getBuffer() {
      this.make();
      return new Uint8Array(this.buffer);
    }

    // 返回base64格式的数据

  }, {
    key: 'getBase64',
    value: function getBase64(withOutPrefix) {
      this.make();
      var prefix = withOutPrefix ? '' : 'data:image/bmp;base64,';
      var base64 = base64js.fromByteArray(new Uint8Array(this.buffer));
      return prefix + base64;
    }

    // 返回16进制的数据，方便调试

  }, {
    key: 'getHex',
    value: function getHex() {
      this.make();
      return Array.prototype.map.call(new Uint8Array(this.buffer), function (x) {
        return x.toString(16).padStart(2, '0');
      }).join('');
    }
  }, {
    key: 'setInt8',
    get: function get() {
      return this.viewSetter.bind(this, 'setInt8', 1);
    }
  }, {
    key: 'setUint8',
    get: function get() {
      return this.viewSetter.bind(this, 'setUint8', 1);
    }
  }, {
    key: 'setInt16',
    get: function get() {
      return this.viewSetter.bind(this, 'setInt16', 2);
    }
  }, {
    key: 'setUint16',
    get: function get() {
      return this.viewSetter.bind(this, 'setUint16', 2);
    }
  }, {
    key: 'setInt32',
    get: function get() {
      return this.viewSetter.bind(this, 'setInt32', 4);
    }
  }, {
    key: 'setUint32',
    get: function get() {
      return this.viewSetter.bind(this, 'setUint32', 4);
    }
  }, {
    key: 'setFloat32',
    get: function get() {
      return this.viewSetter.bind(this, 'setFloat32', 4);
    }
  }, {
    key: 'setFloat64',
    get: function get() {
      return this.viewSetter.bind(this, 'setFloat64', 8);
    }
  }]);

  return Bmp;
}();

Bmp.BINARY = 1;
Bmp.VGA = 4;
Bmp.GREY = 8;
Bmp.RGB = 24;
Bmp.RGBA = 32;


module.exports = Bmp;