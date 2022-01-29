export class SequentialDataView extends DataView {
  currentOffset = 0;

  appendUint16(value: number, littleEndian?: boolean) {
    this.setUint16(this.currentOffset, value, littleEndian);
    this.currentOffset += 2;
  }

  appendUint32(value: number, littleEndian?: boolean) {
    this.setUint32(this.currentOffset, value, littleEndian);
    this.currentOffset += 4;
  }
}
