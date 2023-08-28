pragma circom 2.1.2;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./node_modules/circomlib/circuits/eddsamimcsponge.circom";



/**
proves the knowledge of a valid signature of a nullifier
nullifier = hash(code)
*/ 
template Coupon() {
    signal input code;
    // eddsa signature
    signal input R8x;
    signal input R8y;
    signal input S;
    signal input Ax;
    signal input Ay;
    signal input receiver; // address of the receiver

    signal output nullifier;

    // compute message
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== code;
    
    nullifier <== poseidon.out;

    // Verify the signature

    component verifier = EdDSAMiMCSpongeVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== Ax;
    verifier.Ay <== Ay;
    verifier.S <== S;
    verifier.R8x <== R8x;
    verifier.R8y <== R8y;
    verifier.M <== nullifier;
}

component main { public [Ax, Ay, receiver] }= Coupon();