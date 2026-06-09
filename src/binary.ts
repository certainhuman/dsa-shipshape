import { DsaBpError } from "./errors";
import { SerializerTag } from "./enums";

export type TokenType =
  | "number"
  | "string"
  | "boolean"
  | "null"
  | "array_begin"
  | "array_end"
  | "map_begin"
  | "map_end"
  | "bytes"
  | "end";

export type NumericValue = number | bigint;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class BinaryWriter {
  private bytes: number[] = [];

  writeInt(value: number): void {
    if (value >= 0 && value <= 63) {
      this.bytes.push(value);
    } else if (value >= -64 && value <= -1) {
      this.bytes.push(value + 128);
    } else if (value >= -128 && value <= 127) {
      this.writeTag(SerializerTag.I8);
      this.bytes.push(value & 0xff);
    } else if (value >= -32768 && value <= 32767) {
      this.writeTag(SerializerTag.I16);
      this.writeIntBytes(value, 2);
    } else {
      this.writeTag(SerializerTag.I32);
      this.writeIntBytes(value, 4);
    }
  }

  writeLong(value: bigint | number): void {
    const bigintValue = typeof value === "bigint" ? value : BigInt(value);
    if (bigintValue >= BigInt(-2147483648) && bigintValue <= BigInt(2147483647)) {
      this.writeInt(Number(bigintValue));
      return;
    }

    this.writeTag(SerializerTag.I64);
    this.writeBigInt64(bigintValue);
  }

  writeDouble(value: number): void {
    if (Number.isFinite(value) && value === Math.round(value)) {
      this.writeLong(BigInt(value));
      return;
    }

    const floatValue = Math.fround(value);
    if (Object.is(value, floatValue)) {
      this.writeTag(SerializerTag.F32);
      const buffer = new ArrayBuffer(4);
      new DataView(buffer).setFloat32(0, floatValue, true);
      this.writeBytes(new Uint8Array(buffer));
    } else {
      this.writeTag(SerializerTag.F64);
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, value, true);
      this.writeBytes(new Uint8Array(buffer));
    }
  }

  writeString(value: string): void {
    const bytes = textEncoder.encode(value);
    if (bytes.length <= 0xff) {
      this.writeTag(SerializerTag.STR_L1);
      this.bytes.push(bytes.length);
    } else if (bytes.length <= 0xffff) {
      this.writeTag(SerializerTag.STR_L2);
      this.writeUintBytes(bytes.length, 2);
    } else {
      this.writeTag(SerializerTag.STR_L4);
      this.writeUintBytes(bytes.length, 4);
    }
    this.writeBytes(bytes);
  }

  writeBoolean(value: boolean): void {
    this.writeTag(value ? SerializerTag.TRUE : SerializerTag.FALSE);
  }

  writeNull(): void {
    this.writeTag(SerializerTag.NULL);
  }

  beginArray(): void {
    this.writeTag(SerializerTag.ARRAY_BEGIN);
  }

  endArray(): void {
    this.writeTag(SerializerTag.ARRAY_END);
  }

  writeByteArray(value: Uint8Array): void {
    if (value.length <= 0xff) {
      this.writeTag(SerializerTag.BYTES_L1);
      this.bytes.push(value.length);
    } else if (value.length <= 0xffff) {
      this.writeTag(SerializerTag.BYTES_L2);
      this.writeUintBytes(value.length, 2);
    } else {
      this.writeTag(SerializerTag.BYTES_L4);
      this.writeUintBytes(value.length, 4);
    }
    this.writeBytes(value);
  }

  toBytes(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }

  private writeTag(tag: SerializerTag): void {
    this.bytes.push(tag);
  }

  private writeBytes(bytes: Uint8Array): void {
    this.bytes.push(...bytes);
  }

  private writeIntBytes(value: number, byteLength: 2 | 4): void {
    const buffer = new ArrayBuffer(byteLength);
    const view = new DataView(buffer);
    if (byteLength === 2) view.setInt16(0, value, true);
    else view.setInt32(0, value, true);
    this.writeBytes(new Uint8Array(buffer));
  }

  private writeUintBytes(value: number, byteLength: 2 | 4): void {
    const buffer = new ArrayBuffer(byteLength);
    const view = new DataView(buffer);
    if (byteLength === 2) view.setUint16(0, value, true);
    else view.setUint32(0, value, true);
    this.writeBytes(new Uint8Array(buffer));
  }

  private writeBigInt64(value: bigint): void {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigInt64(0, value, true);
    this.writeBytes(new Uint8Array(buffer));
  }
}

export class BinaryReader {
  private offset = 0;
  private view: DataView;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  peek(): TokenType {
    if (this.offset >= this.bytes.length) return "end";
    const b = this.bytes[this.offset]!;
    if (b <= 0x7f || b >= 0xe0) return "number";
    switch (b) {
      case SerializerTag.U8:
      case SerializerTag.U16:
      case SerializerTag.U32:
      case SerializerTag.U64:
      case SerializerTag.I8:
      case SerializerTag.I16:
      case SerializerTag.I32:
      case SerializerTag.I64:
      case SerializerTag.F32:
      case SerializerTag.F64:
        return "number";
      case SerializerTag.STR_L1:
      case SerializerTag.STR_L2:
      case SerializerTag.STR_L4:
        return "string";
      case SerializerTag.TRUE:
      case SerializerTag.FALSE:
        return "boolean";
      case SerializerTag.NULL:
        return "null";
      case SerializerTag.ARRAY_BEGIN:
        return "array_begin";
      case SerializerTag.ARRAY_END:
        return "array_end";
      case SerializerTag.MAP_BEGIN:
        return "map_begin";
      case SerializerTag.MAP_END:
        return "map_end";
      case SerializerTag.BYTES_L1:
      case SerializerTag.BYTES_L2:
      case SerializerTag.BYTES_L4:
        return "bytes";
      default:
        throw new DsaBpError("UNKNOWN_TOKEN", `Unknown token type: 0x${b.toString(16).padStart(2, "0")}`);
    }
  }

  beginArray(): void {
    this.expectToken("array_begin");
    this.offset++;
  }

  endArray(): void {
    this.expectToken("array_end");
    this.offset++;
  }

  nextNumber(): NumericValue {
    this.expectToken("number");
    const b = this.readUint8();
    if (b <= 0x7f) return b;
    if (b >= 0xe0) return b - 256;

    switch (b) {
      case SerializerTag.U8:
        return this.readUint8();
      case SerializerTag.U16:
        return this.readUint16();
      case SerializerTag.U32:
        return this.readUint32();
      case SerializerTag.U64:
      case SerializerTag.I64:
        return this.readBigInt64();
      case SerializerTag.I8:
        return this.readInt8();
      case SerializerTag.I16:
        return this.readInt16();
      case SerializerTag.I32:
        return this.readInt32();
      case SerializerTag.F32:
        return this.readFloat32();
      case SerializerTag.F64:
        return this.readFloat64();
      default:
        throw new DsaBpError("UNEXPECTED_TOKEN", `Unexpected number token: 0x${b.toString(16)}`);
    }
  }

  nextNumberAsNumber(): number {
    const value = this.nextNumber();
    return typeof value === "bigint" ? Number(value) : value;
  }

  nextNumberAsBigInt(): bigint {
    const value = this.nextNumber();
    return typeof value === "bigint" ? value : BigInt(Math.trunc(value));
  }

  expectNumber(expected: number): void {
    const actual = this.nextNumberAsNumber();
    if (actual !== expected) {
      throw new DsaBpError("UNEXPECTED_TOKEN", `Expected ${expected} but was ${actual}`);
    }
  }

  nextString(): string {
    this.expectToken("string");
    const b = this.readUint8();
    const length = this.parseLength(b - SerializerTag.STR_L1 + 1);
    const value = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return textDecoder.decode(value);
  }

  nextBoolean(): boolean {
    this.expectToken("boolean");
    return this.readUint8() === SerializerTag.TRUE;
  }

  nextNull(): void {
    this.expectToken("null");
    this.offset++;
  }

  nextBytes(): Uint8Array {
    this.expectToken("bytes");
    const b = this.readUint8();
    const length = this.parseLength(b - SerializerTag.BYTES_L1 + 1);
    const value = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  nextAsString(): string {
    const type = this.peek();
    switch (type) {
      case "number":
        return String(this.nextNumber());
      case "string":
        return `"${this.nextString()}"`;
      case "boolean":
        return String(this.nextBoolean());
      case "null":
        this.nextNull();
        return "null";
      case "array_begin":
        this.beginArray();
        return "[";
      case "array_end":
        this.endArray();
        return "]";
      case "map_begin":
        this.offset++;
        return "{";
      case "map_end":
        this.offset++;
        return "}";
      case "bytes":
        return `[${Array.from(this.nextBytes()).join(", ")}]`;
      case "end":
        throw new DsaBpError("UNEXPECTED_TOKEN", "No more data to read");
    }
  }

  private expectToken(expected: TokenType): void {
    const actual = this.peek();
    if (actual !== expected) {
      throw new DsaBpError("UNEXPECTED_TOKEN", `Expected ${expected}, but was ${actual}`);
    }
  }

  private parseLength(byteLength: number): number {
    switch (byteLength) {
      case 1:
        return this.readUint8();
      case 2:
        return this.readUint16();
      case 4:
        return this.readInt32();
      default:
        throw new DsaBpError("UNEXPECTED_TOKEN", "Invalid length size");
    }
  }

  private readUint8(): number {
    return this.bytes[this.offset++]!;
  }

  private readInt8(): number {
    return this.view.getInt8(this.offset++);
  }

  private readUint16(): number {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  private readInt16(): number {
    const value = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return value;
  }

  private readUint32(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  private readInt32(): number {
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  private readBigInt64(): bigint {
    const value = this.view.getBigInt64(this.offset, true);
    this.offset += 8;
    return value;
  }

  private readFloat32(): number {
    const value = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return value;
  }

  private readFloat64(): number {
    const value = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  }
}
