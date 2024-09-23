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

const test = async () => {
  const config = createAppConfig()

  const sender = config.user.toSuiAddress()
  const admin = config.admin.toSuiAddress()
  console.log('sender',sender)
  console.log('admin',admin)
  const sweepstake = config.objectSweepStakeSui
  const shinami = config.shinamiClient
     shinami.getRpcApiVersion()
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
  // //
  // await createMarket(
  //   config,
  //   '1',
  //   sender,
  //   'Rain',
  //   'Will it rain tomorrow?',
  //   'rain',
  //   Date.now().toString(),
  //   (Date.now() + 1000).toString()
  // )
  //
  const market_test = '0x8f0c61785caeb360e965e92d7c9d97da320221b7b4df3c1894acc24c1542b9fe'
  // await mintToken(config, market_test, '2', admin, '100', sender, '100')
  //
  // //
  // await checkYesBalance(config, market_test, sender)
  // await checkNoBalance(config, market_test, sender)
  // await checkMarketInfo(config, market_test)

  await checkYesBalance(config, market_test, admin)
  await checkYesBalance(config, market_test, sender)
  // //
  await transfer_token(config, market_test,'3', admin, sender, '10', true)

  await checkYesBalance(config, market_test, admin);
  await checkYesBalance(config, market_test, sender);
}

test().then(r => console.log(r))
