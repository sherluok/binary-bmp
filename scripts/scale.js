const { GREY } = require('..');

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

module.exports = {
  scale,
};
