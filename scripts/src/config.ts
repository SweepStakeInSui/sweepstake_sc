import * as dotenv from 'dotenv'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography'
import { createSuiClient, GasStationClient } from "@shinami/clients/sui";

dotenv.config()

export class EnvConfig {
  network: 'testnet' | 'mainnet' | 'devnet' | 'localnet'
  privateKey: string
  moduleAddress: string
  adminCapSweepTake: string
  adminCapConditional: string
  objectSweepStakeSui: string
  userPrivateKey: string
  shinamiPrivateKey: string

  // I don't know why my env vars are not being read, so I set in this file :D ??
  constructor() {
    this.network = 'testnet'
    this.privateKey = 'suiprivkey1qqanr8rzh3uk2mkdprjz2gdledt5qx5c6692se559qeteza9qqduzgzn6y5'
    this.shinamiPrivateKey = 'sui_testnet_0e45dbbb403f380943036c9bc168f895'

    this.moduleAddress = '0x23db3e2dbb0b70af5add9b35f05c9331b27e45ed3f69a977194b2c88af3c10f7'
    this.adminCapSweepTake = '0x07ca43c3fcd6418bc4263ef064241353caac5237240230a052cb99baa5596036'
    this.adminCapConditional = '0x62fc05d831210fd95f04c464dca3ef71bcb939d9cef321dd05186ecce629843d'
    // This is default treasury of sweepstake
    this.objectSweepStakeSui = '0x4698043cf8398f78b05b6231e4cc0508b64a9941ccef2f1b2150980014081e33'

    // For testing purposes
    this.userPrivateKey = 'suiprivkey1qr37ll8uquagxc3hwwtd9remne7z2lfs2nczflqp0f5htrqn2tf6ylv00pp'
  }

  private getEnvVar(key: string): string | undefined {
    return process.env[key]
  }

  private getEnvVarOrPanic(key: string): string {
    const value = this.getEnvVar(key)
    if (!value) {
      throw new Error(`Failed to get env var ${key}`)
    }
    return value
  }
}

export class AppConfig {
  client: SuiClient
  moduleAddress: string
  admin: Ed25519Keypair
  user: Ed25519Keypair
  adminCapSweepTake: string
  adminCapConditional: string
  objectSweepStakeSui: string
  shinamiClient: SuiClient
  gasStationClient: GasStationClient

  constructor(config: EnvConfig) {
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') })
    this.moduleAddress = config.moduleAddress
    this.admin = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(config.privateKey).secretKey)
    this.user = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(config.userPrivateKey).secretKey)
    this.adminCapSweepTake = config.adminCapSweepTake
    this.adminCapConditional = config.adminCapConditional
    this.objectSweepStakeSui = config.objectSweepStakeSui
    this.shinamiClient = createSuiClient(config.shinamiPrivateKey)
    this.gasStationClient = new GasStationClient(config.shinamiPrivateKey)
  }
}

export function createAppConfig(): AppConfig {
  const envConfig = new EnvConfig()
  return new AppConfig(envConfig)
}
