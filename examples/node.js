const Bmp = require('../');

const fs = require('fs');
const path = require('path');

// 单色图
const binary = new Bmp(Bmp.BINARY, {
  width: 3,
  height: 3,
  data: [
    0,1,0,
    1,1,1,
    0,1,1,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '1-bit-binary.bmp'), binary.getBuffer());
// 单色图，自定义调色板
binary.setPalette([
  'F44336',
  'FFFFFF',
]);
fs.writeFileSync(path.resolve(__dirname, 'outputs', '1-bit-binary-palette.bmp'), binary.getBuffer());

// 16色VGA图
const vga = new Bmp(Bmp.VGA, {
  width: 4,
  height: 4,
  data: [
    0,1,2,3,
    4,5,6,7,
    8,9,10,11,
    12,13,14,15,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '4-bit-vga.bmp'), vga.getBuffer());
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

// 256色灰度图
const grey = new Bmp(Bmp.GREY, {
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

// RGB图
const rgb = new Bmp(Bmp.RGB, {
  width: 3,
  height: 1,
  data: [
    255,0,0, 255,255,0, 0,0,0,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '24-bit-rgb.bmp'), rgb.getBuffer());
fs.writeFileSync(path.resolve(__dirname, 'outputs', '24-bit-bgr.bmp'), rgb.bgr().getBuffer());

// RGBA图
const rgba = new Bmp(Bmp.RGBA, {
  width: 3,
  height: 1,
  data: [
    255,0,0,0, 0,255,0,128, 0,0,255,255,
  ],
});
fs.writeFileSync(path.resolve(__dirname, 'outputs', '32-bit-rgba.bmp'), rgba.getBuffer());

const logo = new Bmp(Bmp.VGA, {
  width: 57,
  height: 5,
  data: [
    1,2,8,15,15,15,6,8,10,15,15,11,15,15,15,14,15,15,15,12,5,15,15,15,5,0,4,15,15,15,8,15,15,15,4,15,15,15,15,3,0,6,15,15,15,8,15,15,15,4,15,15,5,2,9,15,15,
    8,15,15,9,15,15,15,10,15,15,15,9,12,15,15,13,15,15,6,15,15,7,15,15,3,15,15,13,15,15,15,11,15,0,15,15,15,15,15,7,15,15,12,15,15,8,7,15,1,5,15,15,2,15,15,2,15,
    8,11,5,15,15,15,15,13,15,15,15,8,15,13,15,13,15,15,9,8,2,8,15,15,1,13,2,15,15,15,15,15,10,15,15,15,15,15,15,7,3,11,15,15,15,11,15,5,15,4,15,15,8,1,7,15,15,
    10,15,15,14,15,15,15,13,15,15,15,8,15,15,5,12,15,15,7,15,15,5,15,15,4,15,15,8,15,15,15,15,5,15,15,15,15,15,15,3,15,15,4,15,15,4,15,15,15,12,15,15,10,15,15,15,15,
    13,6,14,15,15,15,0,5,2,15,15,6,15,15,15,1,15,15,8,15,15,10,15,15,13,15,15,9,15,15,15,15,14,15,15,15,15,15,15,3,10,9,15,15,15,11,15,15,15,2,15,15,7,15,15,15,15
  ],
});
logo.setPalette([
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
  'FFFFFF',
]);
fs.writeFileSync(path.resolve(__dirname, 'outputs', 'logo.bmp'), logo.getBuffer());
