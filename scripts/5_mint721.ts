// Mint a setofNFT to the privateAidrop contract
const hre = require("hardhat");

async function main() {

    
    let ERC721_ADDR = "0xa02e13feC224D9cd82c75B7AC152A63A788E5764"; // TO MODIFTY
    let AIRDROP_ADDR = "0x09c9Db564F02Db17DeB7D90089d341B557f14F0a"; // TO MODIFTY
    let zekoNFT = await hre.ethers.getContractAt("ZekoGenerativeNFT", ERC721_ADDR)
    let daoName = "Zeko Badges" // TO MODIFTY
    let daoRole = "Hardcore contributor" // TO MODIFTY
    let quantity = "8"; // TO MODIFTY
    let tx = await zekoNFT.mintRoleToAirdrop(daoName, daoRole, quantity, AIRDROP_ADDR);
    tx.wait();
    console.log(`# ${quantity} NFTs succefully minted and trasferred to ${AIRDROP_ADDR}` )
}

main().then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(-1);
    })