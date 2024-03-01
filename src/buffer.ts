export class SequentialWriter {
  #dataView: DataView;
  #byteOffset = 0;

  constructor(public arrayBuffer: ArrayBuffer) {
    this.#dataView = new DataView(arrayBuffer);
  }

  appendInt8(value: number) {
    this.#dataView.setInt8(this.#byteOffset, value);
    this.#byteOffset += 1;
  }

  appendUint8(value: number) {
    this.#dataView.setUint8(this.#byteOffset, value);
    this.#byteOffset += 1;
  }

  appendInt16(value: number, littleEndian?: boolean) {
    this.#dataView.setInt16(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 2;
  }

  appendUint16(value: number, littleEndian?: boolean) {
    this.#dataView.setUint16(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 2;
  }

  appendInt32(value: number, littleEndian?: boolean) {
    this.#dataView.setInt32(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 4;
  }

  appendUint32(value: number, littleEndian?: boolean) {
    this.#dataView.setUint32(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 4;
  }

  appendFloat32(value: number, littleEndian?: boolean) {
    this.#dataView.setFloat32(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 4;
  }

  appendFloat64(value: number, littleEndian?: boolean) {
    this.#dataView.setFloat64(this.#byteOffset, value, littleEndian);
    this.#byteOffset += 8;
  }
}
