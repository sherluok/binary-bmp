// 颜色字符串转32位二进制数
function bgra2bin(bgrString: string) {
  return parseInt(bgrString.padEnd(8, '0'), 16);
}

export function rgba2bgra(rgbString: string) {
  const s = rgbString.replace(/^#/, '');
  const r = s.slice(0, 2);
  const g = s.slice(2, 4);
  const b = s.slice(4, 6);
  const a = s.slice(6, 8).padEnd(2, 'F');
  return bgra2bin(b + g + r + a);
}
