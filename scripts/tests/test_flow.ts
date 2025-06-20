import {createAppConfig} from '../src/config.js';
import {newTreasury} from '../src/contractsCaller/sweepstake/newTreasury.js';
import {deposit} from "../src/contractsCaller/sweepstake/deposit.js";
import {checkBalance} from "../src/contractsCaller/sweepstake/getBalance.js";
import {withdraw} from "../src/contractsCaller/sweepstake/withdraw.js";

const test = async () => {
    const config = createAppConfig()
    // await newTreasury(
    //     config,
    //     '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC'
    // )

    const sender = config.user.toSuiAddress()
    const admin = config.admin.toSuiAddress()

    const sweepstakeUSDC = '0x42c6941a23f86bf4cfbff36170212b1c32b9e6732887bd58b5f9f2a2ceef9dda'
    // await deposit(
    //   config,
    //   sweepstakeUSDC,
    //   sender,
    //   '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC',
    //   '1000000'
    // )

    const balance = await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')

    await withdraw(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC', '1000000')

    await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')

}
test()
