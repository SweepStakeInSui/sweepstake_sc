import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0x9B25E6286D330722Ea34739E116618FA748CE4fC";
    const abi = [
        "function requestData(string creator, string marketID, string ancillaryString) external returns (bytes32)"
    ];

    const setReward = [
        "function setReward(uint256 _reward)"
    ]
    const setBond = [
        "function setBond(uint256 _bond)"
    ]

    const [admin] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, abi, admin);

    const creator = "0xb8e28e6187B30aA816816e399Bcc711835251E78";
    const marketID = "market-xyzd";
    const ancillaryString = "additional data hehe";

    const tx = await contract.requestData(creator, marketID, ancillaryString);
    // const tx = await contract.setReward(0);
    // const tx  = await contract.setBond(100000000);
    console.log("Transaction sent. Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed. Events:");

    // Log all events to find the questionID if emitted
    for (const event of receipt.events || []) {
        console.log(`- ${event.event}:`, event.args);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
