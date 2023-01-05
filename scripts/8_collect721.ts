// Collect against locally created merkle tree (only the first 4 commitments)
const hre = require("hardhat");
import { readFileSync } from "fs";
import { getMerkleTreeFromPublicListOfCommitments } from "../utils/TestUtils";
import { generateProofCallData, pedersenHash, toHex } from "zkp-merkle-airdrop-lib";

/** Collect an airdrop from the local merkle tree against deployed contract. */
async function main() {
    
    let AIRDROP_ADDR = "0x09c9Db564F02Db17DeB7D90089d341B557f14F0a"; // TO MODIFTY
    
    let singers = await hre.ethers.getSigners();
    let collector = singers[1]

    // TO MODIFTY
    let proof = "0x2232888f9697d9c582c019f6f2ffd308fcd7a5830337915f585d1cc0935b81290c1fcd2175b507ba95f09d53d3b459bf8f085ccb86f825208d6bdc04e083b75b05e85dc163fb5db9f6613d0cb1fa54282cc5b407cf12e7acd6857648f687e00f2d92af11406134f0ac0b40329251e31cc9c143a3576100b2624b1ae183e87cb203f8171a36e9fad5687dfcd8b4cdc8bb5c0333f2a2188a9fe9cc29f018e1eea70a2035888a95f905ca715a506520c4ed846fd5ddee710fdff185758c63aebef22d19ff000b5dec506cd6313a78eae1ee1b1273cb236641227c2e8dd9ee32c22e21dc346ac4e3d603e832669e9fdaf5d38ea749b31afb231c31ed1fd7fd02fbf70b296422e19bf73128a0144e5191ac00e58e3d5298c9b77c13303f8b5287a3ca06eab25adbf84f950cabd78be769a0201b93f26dd7f6f2c74f379392cc8c4ca6217860f4cc1db1c23bbd1be303d5989085aec813aff15084795ec875abc9781401f46bae149db8c4462ca6adcf6cfe7eb3db7ce66af4b219adfe175a3df8b24c15c0d7c11ede6ca4fbb5057bd1a83ec24bf3dd5c61ed6ebac3c97bcf0582c75f0b9d51dbc8d6afbd88fea3d18b61b18d218df79affdb0f2d57226e98f104cfa11bcfb2ecee94556f37ec3ddfd13c8d4b7fa620fbd058425e3565b95e5845e3851e6229d3bcfbdf933d68fbc589d8d6722b26bbf35ffe09936dcc6c84115adab818c4946b81875b1ce3d65d042d0a75ee3d0dce67263791fd4e83c09c5dd9f4a0041b04466cc3d3a29e50661b0be432b24cf5a9bc9e9abe38b08c81233facf0ca00b52fdef28f43a30960f376d0148cb354aae764724529aab717e5087f08411e083b643d15c7b3cd7ef42fb65f2e7a7a3c48d85dbc5b0280a19169f901876e8c1a575bc5968ee3cf1965b571c4efd02cee7226b93670b400f9ad2b654507f5b11da6abd54168dbc4879e650e8bfe9fbfc5694af39a960e07e779377521d7cd3f27be8eea9c97a134f43b852f7e28598a58091773a06f5ed8343552bcf7c682db096dfc5f72bef00b5008e4ab61a22fa4f9f002322a525280064221850fe4d1a41642de2920e2d57863e0eb8727041702f1ffd01c57da4dc9317f92718ef5e74c"
    let nullifierHash = "0x3025a8a8bb7bffc98cc050131fdbffde03613341ad130e3bb5508f3a45d313d0"

    let airdropContract = await hre.ethers.getContractAt("PrivateAirdrop", AIRDROP_ADDR)
    let tx = await airdropContract.connect(collector).collectAirdrop(proof, nullifierHash);
    await tx.wait();
    console.log(`Proof verified => NFT succesfully collected by ${collector.address}!`)

}

main().then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(-1);
    })