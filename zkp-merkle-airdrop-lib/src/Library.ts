/**
 * Library which abstracts away much of the details required to interact with the private airdrop contract.
 */
const snarkjs = require("snarkjs");
const circomlibjs = require('circomlibjs');
const wc = require("./witness_calculator.js");

import { MerkleTree } from './MerkleTree';



let mimcSpongeInstance: any;

const getMimcSponge = async (): Promise<any> => {
  if (mimcSpongeInstance === undefined) {
    mimcSpongeInstance = await circomlibjs.buildMimcSponge();
  }

  return mimcSpongeInstance;
};

let pedersenInstance: any;
const getPedersen = async (): Promise<any> => {
  if (pedersenInstance === undefined) {
    pedersenInstance = await circomlibjs.buildPedersenHash();
  }

  return pedersenInstance;
};

let babyjubInstance: any;
const getBabyjub = async (): Promise<any> => {
  if (babyjubInstance === undefined) {
    babyjubInstance = await circomlibjs.buildBabyjub();
  }

  return babyjubInstance;
};


export async function generateProofCallData(
        merkleTree: MerkleTree, 
        key: BigInt, 
        secret: BigInt, 
        receiverAddr: string,
        circuitWasmBuffer: Buffer,
        zkeyBuffer: Buffer): Promise<string> {
    let inputs = await generateCircuitInputJson(merkleTree, key, secret, BigInt(receiverAddr));

    let witnessCalculator = await wc(circuitWasmBuffer);
    let witnessBuffer = await witnessCalculator.calculateWTNSBin(inputs, 0);

    let { proof, publicSignals } = await snarkjs.plonk.prove(zkeyBuffer, witnessBuffer);

    let proofProcessed = unstringifyBigInts(proof);
    let pubProcessed = unstringifyBigInts(publicSignals);
    let allSolCallData: string = await snarkjs.plonk.exportSolidityCallData(proofProcessed, pubProcessed);
    let solCallDataProof = allSolCallData.split(',')[0];
    return solCallDataProof;
}

export async function mimcSponge(l: BigInt, r: BigInt): Promise<BigInt> {
    const mimcSponge = await getMimcSponge();
    const hash = mimcSponge.multiHash([l, r]);
    return BigInt('0x' + mimcSponge.F.toString(hash, 16));
}

export async function pedersenHash(nullifier: BigInt): Promise<BigInt> {
    return await pedersenHashBuff(toBufferLE(nullifier as any, 31));
}

export async function pedersenHashConcat(nullifier: BigInt, secret: BigInt): Promise<BigInt> {
    let nullBuff = toBufferLE(nullifier as any, 31);
    let secBuff = toBufferLE(secret as any, 31);
    let combinedBuffer = Buffer.concat([nullBuff, secBuff]);
    return pedersenHashBuff(combinedBuffer);
}

export function toHex(number: BigInt, length = 32): string {
    const str: string = number.toString(16);
    return '0x' + str.padStart(length * 2, '0');
}


// Non-exported 

interface CircuitInput {
    root: BigInt;
    nullifierHash: BigInt;
    nullifier: BigInt;
    secret: BigInt;
    pathIndices: number[];
    pathElements: BigInt[];
    recipient: BigInt;
}

async function generateCircuitInputJson(
    mt: MerkleTree, 
    nullifier: BigInt, 
    secret: BigInt,
    recieverAddr: BigInt): Promise<CircuitInput> {
    let commitment = await pedersenHashConcat(nullifier, secret);
    let mp = mt.getMerkleProof(commitment);
    let nullifierHash = await pedersenHash(nullifier);

    let inputObj = {
        root: mt.root.val,
        nullifierHash: nullifierHash,
        nullifier: nullifier,
        secret: secret,
        pathIndices: mp.indices,
        pathElements: mp.vals,
        recipient: recieverAddr
    }
    return inputObj;
}

async function pedersenHashBuff(buff: Buffer): Promise<BigInt> {
    const pedersen = await getPedersen();
    const point = pedersen.hash(buff);
    const babyjub = await getBabyjub();
    // TODO can we improve this?
    const hash = babyjub.unpackPoint(point)[0];
    return BigInt('0x' + babyjub.F.toString(hash, 16));
}

// Lifted from ffutils: https://github.com/iden3/ffjavascript/blob/master/src/utils_bigint.js
function unstringifyBigInts(o: any): any {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        const res: {[key: string]: any}= {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

function toBufferLE(bi: BigInt, width: number): Buffer {
    const hex = bi.toString(16);
    const buffer =
        Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
    buffer.reverse();
    return buffer;
}