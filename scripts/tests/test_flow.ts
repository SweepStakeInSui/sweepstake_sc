import { createAppConfig } from '../src/config';
import { deposit } from '../src/contractsCaller/sweepstake/deposit';
import { newTreasury } from '../src/contractsCaller/sweepstake/newTreasury';
import { withdraw } from '../src/contractsCaller/sweepstake/withdraw';
import { createMarket } from '../src/contractsCaller/conditionalMarket/createMarket';
import { useAccounts } from '@mysten/dapp-kit';
import { mintToken } from '../src/contractsCaller/conditionalMarket/mintToken';
import {
  checkMarketInfo,
  checkNoBalance,
  checkYesBalance,
} from '../src/contractsCaller/conditionalMarket/getInforMarket';
import { transfer_token } from '../src/contractsCaller/conditionalMarket/transferToken';
import { aw } from 'vitest/dist/chunks/reporters.C_zwCd4j';

const test = async () => {
  const config = createAppConfig()

  const sender = config.user.toSuiAddress()
  const admin = config.admin.toSuiAddress()
  // console.log('sender',sender)
  //
  const sweepstake = config.objectSweepStakeSui
  // await deposit(config, sweepstake, sender, '0x2::sui::SUI', '10000')
  // await withdraw(config, sweepstake, sender, '0x2::sui::SUI', '1000')
  // await newTreasury(
  //   config,
  //   '0xea10912247c015ead590e481ae8545ff1518492dee41d6d03abdad828c1d2bde::usdc::USDC'
  // )
  // // We have 0xfbd1b5ef632840a1cbc336ff73affa49ff6c6691142ff3fc5df966435bc06814 id after new_treasury USDC
  const sweepstakeUSDC = '0x6920c8bde35b4cfd1811d93118de9c0b5d4a11fe8c9e700968dafa03f7667f0d'
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
  //   sender,
  //   'Rain',
  //   'Will it rain tomorrow?',
  //   'rain',
  //   Date.now().toString(),
  //   (Date.now() + 1000).toString()
  // )

  const market_test = '0xd9e4660851dd14c352d63112347839e754dc744dd61897597560f49a1ef2f866'
  await mintToken(config, market_test, sender, '1000', sender, '0')

  //
  await checkYesBalance(config, market_test, sender)
  await checkNoBalance(config, market_test, sender)
  await checkMarketInfo(config, market_test)

  //
  await transfer_token(config, market_test, admin, sender, '100', true)
  await checkYesBalance(config, market_test, admin);
  await checkYesBalance(config, market_test, sender);
}

test().then(r => console.log(r))
