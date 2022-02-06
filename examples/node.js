const { join } = require('path');
const { writeFileSync } = require('fs');
const { make, BINARY, VGA, GREY, RGB, RGBA } = require('..');

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

const logo = {
  bits: VGA,
  width: 58,
  height: 7,
  data: [
    15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
    15,1,2,8,15,15,15,6,8,10,15,15,11,15,15,15,14,15,15,15,12,5,15,15,15,5,0,4,15,15,15,8,15,15,15,4,15,15,15,15,3,0,6,15,15,15,8,15,15,15,4,15,15,5,2,9,15,15,
    15,8,15,15,9,15,15,15,10,15,15,15,9,12,15,15,13,15,15,6,15,15,7,15,15,3,15,15,13,15,15,15,11,15,0,15,15,15,15,15,7,15,15,12,15,15,8,7,15,1,5,15,15,2,15,15,2,15,
    15,8,11,5,15,15,15,15,13,15,15,15,8,15,13,15,13,15,15,9,8,2,8,15,15,1,13,2,15,15,15,15,15,10,15,15,15,15,15,15,7,3,11,15,15,15,11,15,5,15,4,15,15,8,1,7,15,15,
    15,10,15,15,14,15,15,15,13,15,15,15,8,15,15,5,12,15,15,7,15,15,5,15,15,4,15,15,8,15,15,15,15,5,15,15,15,15,15,15,3,15,15,4,15,15,4,15,15,15,12,15,15,10,15,15,15,15,
    15,13,6,14,15,15,15,0,5,2,15,15,6,15,15,15,1,15,15,8,15,15,10,15,15,13,15,15,9,15,15,15,15,14,15,15,15,15,15,15,3,10,9,15,15,15,11,15,15,15,2,15,15,7,15,15,15,15,
    15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
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
    '#FFFFFF',
  ],
};

function scale(scalar, options) {
  const { bits, width, height, data } = options;
  const scaledWidth = width * scalar;
  const scaledHeight = height * scalar;
  const scaledData = [];
  for (let r = 0; r < scaledHeight; r += 1) {
    for (let c = 0; c < scaledWidth; c += 1) {
      const x = Math.floor(c / scalar);
      const y = Math.floor(r / scalar);
      const i = width * y + x;
      if (bits <= GREY) {
        scaledData.push(data[i]);
      } else {
        const length = bits / 8;
        const values = data.slice(i * length, (i + 1) * length);
        scaledData.push(...values);
      }
    }
  }
  return {
    ...options,
    width: scaledWidth,
    height: scaledHeight,
    data: scaledData,
  };
}

function save(name, times, options) {
  const scaledOptions = scale(times, options);
  const uint8array = make(scaledOptions);
  const fileName = `${options.bits}-bits-${name}-${times}x.bmp`;
  writeFileSync(join(__dirname, 'outputs', fileName), uint8array);
}

save('binary', 30, binary);
save('binary-palette', 30, binaryPalette);
save('vga', 30, vga);
save('vga-palette', 30, vgaPalette);
save('grey', 30, grey);
save('rgb', 30, rgb);
save('rgba', 30, rgba);
save('logo', 10, logo);
