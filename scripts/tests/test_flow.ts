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

        const sweepstakeUSDC = '0xbf2617ddab6fba342d10a3319308f570ef2a79359fdd782616a08f727fe01883'
        // await deposit(
        //   config,
        //   sweepstakeUSDC,
        //   sender,
        //   '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC',
        //   '1000000'
        // )

        const balance = await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        console.log('Balance:', balance)

        await withdraw(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC', '1000000')

        const newBalance = await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        console.log('New balance:', newBalance)
}

test()
