import { buildEddsa, buildPoseidon } from "circomlibjs";
import * as ffj from "ffjavascript";
import * as snarkjs from "snarkyjs";

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

export async function verifySign(code: string, R8: string[], S: string, A: string[]): Promise<boolean> {
  const eddsa = await buildEddsa();
  const poseidon = await buildPoseidon();
  console.log("verifySign", code, R8, S, A);
  console.log("hash", poseidon([toDecimalString(fromHexString(code))]));
  console.log("R8", [fromHexString(R8[0]), fromHexString(R8[1])]);

  return eddsa.verifyMiMCSponge(
    poseidon([toDecimalString(fromHexString(code))]),
    { R8: [fromHexString(R8[0]), fromHexString(R8[1])], S: BigInt(S) },
    [fromHexString(A[0]), fromHexString(A[1])],
  );
}

export async function generateProof(receiverAddr: string, code: string, R8: string[], S: string, A: string[]) {
  const eddsa = await buildEddsa();

  // A, R8 are in Montgomery form, convert to int to pass to snarkjs
  const Ax = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(fromHexString(A[0])));
  const Ay = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(fromHexString(A[1])));
  const R8x = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(fromHexString(R8[0])));
  const R8y = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(fromHexString(R8[1])));

  const input = {
    code: toDecimalString(fromHexString(code)),
    Ax: BigInt(Ax).toString(),
    Ay: BigInt(Ay).toString(),
    R8x: BigInt(R8x).toString(),
    R8y: BigInt(R8y).toString(),
    S: toDecimalString(fromHexString(S)),
    receiver: BigInt(receiverAddr).toString(),
  };
  console.log("input", input);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, "coupon.wasm", "coupon.zkey");
  // console.log("proof", proof);
  // console.log("publicSignals", publicSignals);

  //convert proof to solidity inputs
  const { a, b, c } = getABCFrom(proof);
  console.log([a, b, c, publicSignals]);
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
