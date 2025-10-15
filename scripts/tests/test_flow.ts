import {createAppConfig} from '../src/config.js';
import {newTreasury} from '../src/contractsCaller/sweepstake/newTreasury.js';
import {deposit} from "../src/contractsCaller/sweepstake/deposit.js";
import {checkBalance} from "../src/contractsCaller/sweepstake/getBalance.js";
import {withdraw} from "../src/contractsCaller/sweepstake/withdraw.js";

const test = async () => {
        const config = createAppConfig()
        await newTreasury(
            config,
            '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
        )

        // const sender = config.user.toSuiAddress()
        // const admin = config.admin.toSuiAddress()

        // const sweepstakeUSDC = '0xf680ceaa2f3945be7265abb0a91e91153e5e469319d6d475434df56d308e37ad'
        // await deposit(
        //   config,
        //   sweepstakeUSDC,
        //   sender,
        //   '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC',
        //   '1000000'
        // )

        // const balance = await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        // console.log('Balance:', balance)

        // await withdraw(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC', '1000000')

        // const newBalance = await checkBalance(config, sweepstakeUSDC, "0x3b948678119f4c675d77227c983651bbb651078926657497fa96e7fdf6579a44", '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        // await checkBalance(config, sweepstakeUSDC, "0x71787e7d7a6ac7df1df2fa985652bb03da0c8700ec34e02ce006166182994037", '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')


        // console.log('New balance:', newBalance)
}

test()
