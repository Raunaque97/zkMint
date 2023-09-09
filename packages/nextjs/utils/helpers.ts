import { buildEddsa, buildPoseidon } from "circomlibjs";
import * as ffj from "ffjavascript";

const groth16 = require("snarkjs").groth16;

export function fromHexString(hexString: string): Uint8Array {
  if (hexString == null) return new Uint8Array();
  if (hexString.startsWith("0x")) hexString = hexString.slice(2);
  // @ts-ignore
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

export function toHexString(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}
export function toDecimalString(bytes: Uint8Array): string {
  return BigInt("0x" + toHexString(bytes)).toString();
}

export async function calcNullifier(code: string): Promise<bigint> {
  const poseidon = await buildPoseidon();
  return BigInt(poseidon.F.toString(poseidon([toDecimalString(fromHexString(code))])));
}
/**
 *
 * @param code is a hex string
 * @param R8 is in montgomery form
 * @param S is a bigint
 * @param Ax is a bigint of canonical form
 * @param Ay is a bigint of canonical form
 * @returns
 */
export async function verifySign(code: string, R8: Uint8Array[], S: bigint, Ax: bigint, Ay: bigint): Promise<boolean> {
  const eddsa = await buildEddsa();
  const poseidon = await buildPoseidon();
  // convert Ax, Ay to montgomery form
  const A = [eddsa.babyJub.F.e(Ax.toString()), eddsa.babyJub.F.e(Ay.toString())];
  return eddsa.verifyMiMCSponge(poseidon([toDecimalString(fromHexString(code))]), { R8, S }, A);
}
/**
 * @param receiverAddr in hex string 0x...
 * @param code is a hex string
 * @param R8 is in montgomery form
 * @param S is bigint in canonical form
 * @param Ax is a hex string of canonical form
 * @param Ay is a hex string of canonical form
 * @returns
 */
export async function generateProof(
  receiverAddr: string,
  code: string,
  R8: Uint8Array[],
  S: bigint,
  Ax: bigint,
  Ay: bigint,
) {
  const eddsa = await buildEddsa();
  // R8 are in Montgomery form, convert to int to pass to snarkjs
  const R8x = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(R8[0]));
  const R8y = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(R8[1]));
  const input = {
    code: toDecimalString(fromHexString(code)),
    Ax: Ax.toString(),
    Ay: Ay.toString(),
    R8x: BigInt(R8x).toString(),
    R8y: BigInt(R8y).toString(),
    S: S.toString(),
    receiver: BigInt(receiverAddr).toString(),
  };
  // console.log("input", input);
  const { proof, publicSignals } = await groth16.fullProve(input, "coupon.wasm", "coupon.zkey");
  //convert proof to solidity inputs
  const { a, b, c } = getABCFrom(proof);
  console.log("proof", [a, b, c, publicSignals]);
  return { a, b, c, publicSignals };
}

function getABCFrom(proof: { pi_a: any[]; pi_b: any[][]; pi_c: any[] }) {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
}
