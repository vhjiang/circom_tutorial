const hre = require("hardhat");
import {getMerkleRoot, addNewCommitment, randomBigInt, getMerkleTreeFromPublicListOfCommitments} from "../utils/TestUtils";
import {toHex, pedersenHashConcat } from "zkp-merkle-airdrop-lib";

/**
 * when a new commitment comes it, update the public list of commitments and the merkle root stored inside the airdrop contract 
 */

async function main() {


    let inputFileName = "./public/publicCommitments.txt" 
    let treeHeight = 5;

    let nullifierHex = toHex(randomBigInt(31)) 
    let secretHex = toHex(randomBigInt(31))

    let nullifier = BigInt(nullifierHex)
    let secret = BigInt (secretHex)
    let commitment = await pedersenHashConcat(nullifier, secret)
    let hexCommitment = toHex(commitment)

    // update the public list of commitments
    await addNewCommitment(inputFileName,hexCommitment,treeHeight)
    // generate the merkletree
    let mt = await getMerkleTreeFromPublicListOfCommitments(inputFileName, treeHeight)
    let newRoot = getMerkleRoot(mt)
    console.log(`new commitment generated ${hexCommitment} from nullifier: ${nullifierHex} and secret ${secretHex}`)

    let AIRDROP_ADDR = "0x09c9Db564F02Db17DeB7D90089d341B557f14F0a"; // TO MODIFTY
    let airdropContract = await hre.ethers.getContractAt("PrivateAirdrop", AIRDROP_ADDR)
    await airdropContract.updateRoot(newRoot);

    console.log(`merkleRoot storage variable succesfully updated to ${newRoot} `)
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    })