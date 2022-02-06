const { join } = require('path');
const { writeFileSync } = require('fs');
const { make, BINARY, VGA, GREY, RGB, RGBA } = require('..');
const { scale } = require('./scale');

const binary = {
  bits: BINARY,
  width: 3,
  height: 3,
  data: [
    0,1,0,
    1,1,1,
    0,1,1,
  ],
};

const binaryPalette = {
  bits: BINARY,
  width: 3,
  height: 3,
  data: [
    0,1,0,
    1,1,1,
    0,1,1,
  ],
  palette: [
    '#F44336',
    '#FFFFFF',
  ],
};

const vga = {
  bits: VGA,
  width: 4,
  height: 4,
  data: [
    0,1,2,3,
    4,5,6,7,
    8,9,10,11,
    12,13,14,15,
  ],
};

const vgaPalette = {
  bits: VGA,
  width: 4,
  height: 4,
  data: [
    0,1,2,3,
    4,5,6,7,
    8,9,10,11,
    12,13,14,15,
  ],
  palette: [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
  ],
};

const grey = {
  bits: GREY,
  width: 4,
  height: 4,
  data: [
    0,17,34,51,
    68,85,102,119,
    136,153,170,187,
    204,221,238,255,
  ],
};

const rgb = {
  bits: RGB,
  width: 3,
  height: 1,
  data: [
    255,0,0, 255,255,0, 0,0,0,
  ],
};

const rgba = {
  bits: RGBA,
  width: 3,
  height: 1,
  data: [
    255,0,0,0, 0,255,0,128, 0,0,255,255,
  ],
};

function create(name, multiple, options) {
  writeFileSync(join(__dirname, `../assets/${options.bits}-bits-${name}-${multiple}x.bmp`), make(scale(multiple, options)));
}

create('binary', 30, binary);
create('binary-palette', 30, binaryPalette);
create('vga', 30, vga);
create('vga-palette', 30, vgaPalette);
create('grey', 30, grey);
create('rgb', 30, rgb);
create('rgba', 30, rgba);
