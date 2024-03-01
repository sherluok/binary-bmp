export function * range(start: number, end: number): Generator<[value: number, index: number]> {
  if (start < end) {
    for (let i = 0; i <= end - start; i += 1) {
      yield [start + i, i];
    }
  } else {
    for (let i = 0; i <= start - end; i += 1) {
      yield [start - i, i];
    }
  }
}
