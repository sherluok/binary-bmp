const { Bits, Bitmap } = window.Bmp;

const binaryImg = document.getElementById('binary');
const vgaImg = document.getElementById('vga');
const greyImg = document.getElementById('grey');
const rgbImg = document.getElementById('rgb');
const rgbaImg = document.getElementById('rgba');

const backgroundColorPicker = document.getElementById('background');
const flipCheckbox = document.getElementById('flip');

const canvas = document.getElementById('source');

const width = 200 * window.devicePixelRatio;
const height = 150 * window.devicePixelRatio;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

(function initCanvas() {
  fetch('./test.png').then(async (res) => {
    const blob = await res.blob();
    const image = await createImageBitmap(blob);
    resetCanvas(image);

    backgroundColorPicker.addEventListener('change', () => resetCanvas(image));
    flipCheckbox.addEventListener('change', () => resetCanvas(image));
  });
})();

function resetCanvas(image) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ff000022';
  ctx.fillRect(0, 0, width, height);

  const [dw, dh] = image.width > image.height
    ? [width, width * (image.height / image.width)]
    : [height * (image.width / image.height), height]
  ;
  ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);

  previewImage(Bits.BINARY, binaryImg);
  previewImage(Bits.GREY, greyImg);
  previewImage(Bits.VGA, vgaImg);
  previewImage(Bits.RGB, rgbImg);
  previewImage(Bits.RGBA, rgbaImg);
}

function previewImage(targetBits, imgElement) {
  const backgroundColor = backgroundColorPicker.value;
  const flipY = flipCheckbox.checked;
  // 设置背景色
  const rgbaBitmap = Bitmap.fromCanvas(canvas).background(backgroundColor);
  // 垂直翻转
  if (flipY) {
    rgbaBitmap.flip();
  }
  // 转换颜色位值
  const targetBitmap = rgbaBitmap.bits(targetBits);
  // 生成 Blob 对象，生成临时预览 URL
  imgElement.setAttribute('src', URL.createObjectURL(targetBitmap.blob()));
  imgElement.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = getFileSize(targetBitmap.arrayBuffer());
}

function getFileSize(arrayBuffer) {
  const byteLength = arrayBuffer.byteLength;
  if (byteLength < 1024) {
    return `${byteLength} B`;
  }
  return `${(byteLength / 1024).toFixed(2)} KB`;
}
