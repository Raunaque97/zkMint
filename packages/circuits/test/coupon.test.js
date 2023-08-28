import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { exit } from "process";
import { buildEddsa, buildPoseidon } from "circomlibjs";
import * as ffj from "ffjavascript";
import * as snarkjs from "snarkjs";

const ReceiverAddress = "0x23Fc32698598980c628e8BC6a5DCCf79B2652d73";
//create private key
const privateKey = randomBytes(32);
// const privateKey = fromHexString(
//   "c184baa56b137b7129ea145494f86dafb92dcce74cb0197b38ad4df33708f40a"
// );
const code = randomBytes(31); // should be < 253 bits
// const code = fromHexString(
//   "c184baa56b137b7129ea145494f86dafb92dcce74cb0197b38ad4df33708ff"
// );

const eddsa = await buildEddsa();
const poseidon = await buildPoseidon();
// get public key from private key
const A = eddsa.prv2pub(privateKey);

console.log("Creating a coupon from code:", toHexString(code));
// sign nullifier, nullifier = poseidon(code)
const { R8, S } = eddsa.signMiMCSponge(
  privateKey,
  poseidon([toDecimalString(code)])
);
// verify signature
let verified = eddsa.verifyMiMCSponge(
  poseidon([toDecimalString(code)]),
  { R8, S },
  A
);
if (!verified) {
  console.log("Signature verification failed");
  exit(0);
}

// create input for proof
// A, R8 are in Montgomery form, convert to int to pass to snarkjs
const Ax = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(A[0]));
const Ay = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(A[1]));
const R8x = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(R8[0]));
const R8y = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(R8[1]));
const input = {
  code: toDecimalString(code),
  Ax: BigInt(Ax).toString(),
  Ay: BigInt(Ay).toString(),
  R8x: BigInt(R8x).toString(),
  R8y: BigInt(R8y).toString(),
  S: S.toString(),
  receiver: BigInt(ReceiverAddress).toString(),
};
// console.log("input:", input);
// save input to file
writeFileSync("input.json", JSON.stringify(input));

// check if the .wasm & .zkey files exist else quit
if (!existsSync("coupon.wasm")) {
  console.log("coupon.wasm not found, run yarn circuit:compile");
  exit(0);
}
if (!existsSync("coupon.zkey")) {
  console.log("coupon.zkey not found, run yarn circuit:compile");
  exit(0);
}

/////////////////////////////////////////////////////////////////////////
// Test if proof creataion and verification works
console.log("Testing proof creation and verification");

console.log("Creating proof...");
let time = Date.now();
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  "coupon.wasm",
  "coupon.zkey"
);
console.log("Proof created in " + (Date.now() - time) + "ms");
// verify proof
console.log("Verifying proof...");
time = Date.now();
// get verification key from coupon_vk.json
const verification_key = JSON.parse(readFileSync("coupon_vk.json").toString());
verified = await snarkjs.groth16.verify(verification_key, publicSignals, proof);
if (!verified) {
  console.log("Proof verification failed");
  exit(0);
}
console.log("Proof verified in " + (Date.now() - time) + "ms");

/////////////////////////////////////////////////////////////////////////
// Test if verification fails for forged proof / proof manipulation
console.log("Testing if verification fails for forged proof");

const publicSignalsForgered = publicSignals.slice();
publicSignalsForgered[3] = BigInt(
  "0x23Fc32698598980c628e8BC6a5DCCf79B2652d74"
).toString();
verified = await snarkjs.groth16.verify(
  verification_key,
  publicSignalsForgered,
  proof
);
if (verified) {
  console.log("Should not be verify");
  exit(0);
} else {
  console.log("Proof verification failed as expected");
}

exit(0);

/////////////////////////////////////////////////////////////////////////
//                     Helper functions                                //
/////////////////////////////////////////////////////////////////////////
function fromHexString(hexString) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}
function toHexString(bytes) {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}
function toDecimalString(bytes) {
  return BigInt("0x" + toHexString(bytes)).toString();
}
