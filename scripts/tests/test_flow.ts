import { createAppConfig } from '../src/config'
import { deposit } from '../src/contracts_caller/deposit'

const test_deposit = async () => {
  const config = createAppConfig()

  const sender = config.user.toSuiAddress()

  const adminCap = config.adminCap
  await deposit(config, sender, adminCap, 'SUI', '0x2::sui::SUI', '100000')
}

test_deposit().then(r => console.log(r))
