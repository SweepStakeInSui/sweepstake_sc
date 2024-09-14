import { createAppConfig } from '../src/config'
import { createMarket } from '../src/contractsCaller/conditionalMarket/createMarket'
import {
  checkMarketInfo,
  checkNoBalance,
  checkYesBalance
} from "../src/contractsCaller/conditionalMarket/getInforMarket";
import { mintToken } from "../src/contractsCaller/conditionalMarket/mintToken";
import { deposit } from "../src/contractsCaller/sweepstake/deposit";

const test_deposit = async () => {
  const config = createAppConfig()

  const sender = config.user.toSuiAddress()

  const adminCap = config.adminCap
  const sweepstake = config.objectSweepStakeSui
  await deposit(config, sweepstake, sender, '0x2::sui::SUI', '11000')
  //await withdraw(config, sweepstake, sender, '0x2::sui::SUI', '1000000')
  // await new_treasury(
  //   config,
  //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC'
  // )
  // We have 0x118a17234bc567498c2f5b6b3373b609165dc8e2a65aa3dab6a57e2319398858 id after new_treasury USDC
  const sweepstakeUSDC = '0x6ef4b90fdf0b8ac959c32a2793ccc5bb4add63493083b8f170f7cc01c649eae6'
  // await deposit(
  //   config,
  //   sweepstakeUSDC,
  //   sender,
  //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC',
  //   '1000000'
  // )
  // await withdraw(
  //   config,
  //   sweepstakeUSDC,
  //   sender,
  //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC',
  //   '100000'
  // )

  // await createMarket(
  //   config,
  //   'Will it rain tomorrow?',
  //   'rain',
  //   Date.now().toString(),
  //   (Date.now() + 1000).toString()
  // )

  // const market_test = '0xaeebbe07ef99fcfe3471c4d077656a3808ee75b94d150104d7b085fa5496ebdf'
  // // await mintToken(config, market_test, sender, '1000', sender, '0')
  //
  // await checkYesBalance(config, market_test, sender)
  // await checkNoBalance(config, market_test, sender)
  // await checkMarketInfo(config, market_test)
}

test_deposit().then(r => console.log(r))
