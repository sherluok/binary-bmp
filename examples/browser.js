// 请用浏览器打开./browser.html查看效果

function objectURL(uint8array) {
  const blob = new Blob([uint8array], { type: 'image/bmp' });
  return URL.createObjectURL(blob);
}

const image = new Image();
image.setAttribute('src', lennaBase64);
image.addEventListener('load', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  
  const rgba = Bmp.fromCanvas(Bmp.RGBA, canvas);
  const grey = Bmp.fromCanvas(Bmp.GREY, canvas);
  const binary = Bmp.fromCanvas(Bmp.BINARY, canvas);
  
  document.getElementById('rgba-bmp').src = objectURL(rgba);
  document.getElementById('grey-bmp').src = objectURL(grey);
  document.getElementById('binary-bmp').src = objectURL(binary);
});
