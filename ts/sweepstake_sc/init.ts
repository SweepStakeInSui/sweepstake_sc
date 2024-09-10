import * as betMarketplace from './bet-marketplace/structs'
import { StructClassLoader } from '../_framework/loader'

export function registerClasses(loader: StructClassLoader) {
  loader.register(betMarketplace.AdminCap)
  loader.register(betMarketplace.Deposit)
  loader.register(betMarketplace.Sweepstake)
}
