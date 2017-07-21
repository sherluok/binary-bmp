// 请用浏览器打开./browser.html查看效果

const lennaImg = document.getElementById('lenna-jpg');
lennaImg.src = lenna;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.drawImage(lennaImg, 0, 0);

const rgba = new Bmp(Bmp.RGBA, canvas);
document.getElementById('rgba-bmp').src = rgba.getBase64();

const grey = new Bmp(Bmp.GREY, canvas);
document.getElementById('grey-bmp').src = grey.getBase64();

const binary = new Bmp(Bmp.BINARY, canvas);
document.getElementById('binary-bmp').src = binary.getBase64();
