const Bmp = require('../');

const fs = require('fs');
const path = require('path');

// 单色图
const binary = new Bmp(1, {
  width: 3,
  height: 3,
  data: [
    0,1,0,
    1,1,1,
    0,1,1,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '1-bit-binary.bmp'), binary.getBuffer());
console.log('1-bit-binary.bmp:', binary.getBase64());
// 单色图，自定义调色板
binary.setPalette([
  'F44336',
  'FFFFFF',
]);
fs.writeFileSync(path.resolve(__dirname, 'outputs', '1-bit-binary-palette.bmp'), binary.getBuffer());
console.log('1-bit-binary.bmp:', binary.getBase64());

// 16色VGA图
const vga = new Bmp(4, {
  width: 4,
  height: 4,
  data: [
    0,  1, 2, 3,
    4,  5, 6, 7,
    8,  9,10,11,
    12,13,14,15,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '4-bit-vga.bmp'), vga.getBuffer());
console.log('4-bit-vga.bmp:', vga.getBase64());
// 16色VGA图，自定义调色板
vga.setPalette([
  'F44336',
  'E91E63',
  '9C27B0',
  '673AB7',
  '3F51B5',
  '2196F3',
  '03A9F4',
  '00BCD4',
  '009688',
  '4CAF50',
  '8BC34A',
  'CDDC39',
  'FFEB3B',
  'FFC107',
  'FF9800',
  'FF5722',
]);
fs.writeFileSync(path.resolve(__dirname, 'outputs', '4-bit-vga-palette.bmp'), vga.getBuffer());
console.log('4-bit-vga-palette.bmp:', vga.getBase64());

// 256色灰度图
const grey = new Bmp(8, {
  width: 4,
  height: 4,
  data: [
    0,17,34,51,
    68,85,102,119,
    136,153,170,187,
    204,221,238,255,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '8-bit-grey.bmp'), grey.getBuffer());
console.log('8-bit-grey.bmp:', grey.getBase64());

// RGB图
const rgb = new Bmp(24, {
  width: 3,
  height: 1,
  data: [
    255,0,0, 255,255,0, 0,0,0,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '24-bit-rgb.bmp'), rgb.getBuffer());
console.log('24-bit-rgb.bmp:', rgb.getBase64());
fs.writeFileSync(path.resolve(__dirname, 'outputs', '24-bit-bgr.bmp'), rgb.bgr().getBuffer());
console.log('24-bit-bgr.bmp:', rgb.bgr().getBase64());

// RGBA图
const rgba = new Bmp(32, {
  width: 3,
  height: 1,
  data: [
    255,0,0,0, 0,255,0,128, 0,0,255,255,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '32-bit-rgba.bmp'), rgba.getBuffer());
console.log('32-bit-rgba.bmp:', rgba.getBase64());
