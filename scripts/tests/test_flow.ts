import {createAppConfig} from '../src/config.js';
import {deposit} from "../src/contractsCaller/sweepstake/deposit.js";
import {checkBalance} from "../src/contractsCaller/sweepstake/getBalance.js";
import {withdraw} from "../src/contractsCaller/sweepstake/withdraw.js";
import {updateAdminPubkey} from "../src/contractsCaller/sweepstake/updatePubkey.js";
import { createMarket } from '../src/contractsCaller/conditionalMarket/createMarket.js';
import { newTreasury } from '../src/contractsCaller/sweepstake/newTreasury.js';

const test = async () => {
        const config = createAppConfig()
        // await newTreasury(
        //     config,
        //     '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC'
        // )

        const sender = config.user.toSuiAddress()
        const admin = config.admin.toSuiAddress()
        //
        const sweepstakeUSDC = '0x1d1b39c34ba7f8593bc3e1519700a9626ca2bfa18a61614a4f4128200830daaa'
        
        // Update admin pubkey for existing treasury

        // await deposit(
        //   config,
        //   sweepstakeUSDC,
        //   sender,
        //   '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC',
        //   '50000000'
        // )
        const checker = '0x3b948678119f4c675d77227c983651bbb651078926657497fa96e7fdf6579a44'
        const balance = await checkBalance(config, sweepstakeUSDC, checker, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        console.log('Balance:', balance)
        // //
        // await withdraw(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC', '1000000')

        // const newBalance = await checkBalance(config, sweepstakeUSDC, sender, '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC')
        // console.log('New balance:', newBalance)

        // await createMarket(
        //   config,
        //   ['1','2'],
        //   sender,
        //   ['Test Market', 'Test Market 2'],
        //   'Will it rain tomorrow?',
        //   '1751211486000',
        //   '1751297886000',
        //   sweepstakeUSDC,
        //   '0xba8ce0ab447ccb78484cc0932cb776d3c76bf6f05f36923c931d8d1a96375b88::USDC::USDC'
        // )
}

test().catch((err) => {
  console.error('Test flow failed:', err)
  console.error('Error message:', err?.message)
  console.error('Error stack:', err?.stack)
  process.exit(1)
})
