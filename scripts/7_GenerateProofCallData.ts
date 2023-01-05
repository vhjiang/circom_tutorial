// Collect against locally created merkle tree (only the first 4 commitments)
import { readFileSync } from "fs";
import { getMerkleRoot, getMerkleTreeFromPublicListOfCommitments } from "../utils/TestUtils";
import { generateProofCallData, pedersenHash, toHex } from "zkp-merkle-airdrop-lib";

/** Generate the proof call data. */
// No on-chain interaction yet, everything happens off-chain

async function main() {

    let WASM_PATH = "./build/circuit_js/circuit.wasm";
    let ZKEY_PATH = "./build/circuit_final.zkey"; 
    let commitmentsFileName = "./public/publicCommitments.txt" 

    let nullifierHex  = "0x002207e053fa9e5add9d03231c2d09d0056c198b3ee3b8c5a141ba1dc29cf99c" // TO MODIFTY
    let secretHex = "0x00958deea1d7fbc72df341da7a7bd6977cc261ba33c040956bee5246383207fc" // TO MODIFTY
 
    let WASM_BUFF = readFileSync(WASM_PATH);
    let ZKEY_BUFF = readFileSync(ZKEY_PATH);
    
    let singers = await hre.ethers.getSigners();
    let collector = singers[1]
    let collectorAddress = collector.address

    let nullifier = BigInt(nullifierHex)
    let secret = BigInt (secretHex)

    let mt = await getMerkleTreeFromPublicListOfCommitments(commitmentsFileName, 5)
    let newRoot = getMerkleRoot(mt)

    let newProof =
        await generateProofCallData(
            mt,
            nullifier,   
            secret,
            collectorAddress,
            WASM_BUFF,
            ZKEY_BUFF);        


    let newNullifierHash = toHex(await pedersenHash(nullifier)); // hash of the nullifier => need to be passed to avoid double spending

    console.log("Proof: ", newProof) ; 
    console.log("nullifier Hash", newNullifierHash)
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    })