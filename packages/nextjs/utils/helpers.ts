export function fromHexString(hexString: string): Uint8Array {
  if (hexString == null) return new Uint8Array();
  if (hexString.startsWith("0x")) hexString = hexString.slice(2);
  if (hexString.length % 2 !== 0) throw new Error("Must have an even number of hex digits");
  // @ts-ignore
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

export function toHexString(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}
export function toDecimalString(bytes: Uint8Array): string {
  return BigInt("0x" + toHexString(bytes)).toString();
}
