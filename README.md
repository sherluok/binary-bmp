# binary-bmp
纯JS编写,可以将数组或canvas转换成单色点位图

### 安装

	npm install binary-bmp

### 使用
```javascript
const Bmp = require('binary-bmp');
```

----
### 单色图
```javascript
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
console.log(binary.getBase64());
console.log(binary.getBuffer());
```
<img alt="1-bit-binary.bmp" src="./examples/outputs/readme/1-bit-binary.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

```javascript
// 单色图，自定义调色板
binary.setPalette([
  'F44336',
  'FFFFFF',
]);
console.log(binary.getBase64());
console.log(binary.getBuffer());
```
<img alt="1-bit-binary-palette.bmp" src="./examples/outputs/readme/1-bit-binary-palette.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

----
### VGA位图
```javascript
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
```
<img alt="4-bit-vga.bmp" src="./examples/outputs/readme/4-bit-vga.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

```javascript
// 单色图，自定义调色板
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
```
<img alt="4-bit-vga-palette.bmp" src="./examples/outputs/readme/4-bit-vga-palette.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

---
### 灰度图
```javascript
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
```
<img alt="8-bit-grey.bmp" src="./examples/outputs/readme/8-bit-grey.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

---
### RGB图
```javascript
// RGB图
const rgb = new Bmp(24, {
  width: 3,
  height: 1,
  data: [
    255,0,0, 255,255,0, 0,0,0,
  ],
});
```
<img alt="24-bit-rgb.bmp" src="./examples/outputs/readme/24-bit-rgb.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

```javascript
// BGR顺序
rgb.bgr();
```
<img alt="24-bit-bgr.bmp" src="./examples/outputs/readme/24-bit-bgr.png" width="100" style="box-shadow: 0 0 5px #CCC;" />

---
### RGBA图
```javascript
// RGBA图
const rgba = new Bmp(32, {
  width: 3,
  height: 1,
  data: [
    255,0,0,0, 0,255,0,128, 0,0,255,255,
  ],
});
```
<img alt="32-bit-rgba.bmp" src="./examples/outputs/readme/32-bit-rgba.png" width="100" style="box-shadow: 0 0 5px #CCC;" />
