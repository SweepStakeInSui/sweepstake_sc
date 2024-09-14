import { createAppConfig } from '../src/config'
import { createMarket } from '../src/contractsCaller/conditionalMarket/createMarket'
import {
  checkMarketInfo,
  checkNoBalance,
  checkYesBalance
} from "../src/contractsCaller/conditionalMarket/getInforMarket";
import { mintToken } from "../src/contractsCaller/conditionalMarket/mintToken";
import { deposit } from "../src/contractsCaller/sweepstake/deposit";
import { newTreasury } from "../src/contractsCaller/sweepstake/newTreasury";
import { withdraw } from "../src/contractsCaller/sweepstake/withdraw";

const test = async () => {
  const config = createAppConfig()

  const sender = config.user.toSuiAddress()
  // console.log('sender',sender)
  //
  const sweepstake = config.objectSweepStakeSui
  await deposit(config, sweepstake, sender, '0x2::sui::SUI', '110000')
  // await withdraw(config, sweepstake, sender, '0x2::sui::SUI', '1000')
  // await newTreasury(
  //   config,
  //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC'
  // )
  // // We have 0xfbd1b5ef632840a1cbc336ff73affa49ff6c6691142ff3fc5df966435bc06814 id after new_treasury USDC
  // const sweepstakeUSDC = '0xfbd1b5ef632840a1cbc336ff73affa49ff6c6691142ff3fc5df966435bc06814'
  // // await deposit(
  // //   config,
  // //   sweepstakeUSDC,
  // //   sender,
  // //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC',
  // //   '1000000'
  // // )
  // // await withdraw(
  // //   config,
  // //   sweepstakeUSDC,
  // //   sender,
  // //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC',
  // //   '100000'
  // // )

  // await createMarket(
  //   config,
  //   'Rain',
  //   'Will it rain tomorrow?',
  //   'rain',
  //   Date.now().toString(),
  //   (Date.now() + 1000).toString()
  // )

  const market_test = '0x943bfbd5ecc597e3a9944327490db0f67b8c492ce5dac58e953d418d8576fc3d'
  // await mintToken(config, market_test, sender, '1000', sender, '0')

  //
  // await checkYesBalance(config, market_test, sender)
  // await checkNoBalance(config, market_test, sender)
  // await checkMarketInfo(config, market_test)
}

test().then(r => console.log(r))
