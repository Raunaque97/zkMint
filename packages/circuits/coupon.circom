pragma circom 2.1.2;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./node_modules/circomlib/circuits/eddsamimcsponge.circom";



/**
proves the knowledge of a valid signature of a nullifier
nullifier = hash(secret, amount)
*/ 
template Coupon() {
    signal input secret;
    signal input amount;

    // eddsa signature
    signal input R8x;
    signal input R8y;
    signal input S;
    signal input Ax;
    signal input Ay;

    signal input address;

    signal output beneficiary; // address of the beneficiary
    signal output nullifier;

    // compute message
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== secret;
    poseidon.inputs[1] <== amount;
    
    nullifier <== poseidon.out;
    beneficiary <== address;

    // Verify the signature

    component verifier = EdDSAMiMCSpongeVerifier();
    verifier.enabled <== 0;
    verifier.Ax <== Ax;
    verifier.Ay <== Ay;
    verifier.S <== S;
    verifier.R8x <== R8x;
    verifier.R8y <== R8y;
    verifier.M <== nullifier;
}

component main { public [amount, Ax, Ay] }= Coupon();