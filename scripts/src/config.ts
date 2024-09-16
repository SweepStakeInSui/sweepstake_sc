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

    this.moduleAddress = '0x2ac81659bc3f02345cb7971160a25ae21c9ef3e1e7bffa82ac9627a57116df82'
    this.adminCapSweepTake = '0x16f002a2d87a3e560f1a75bf69f4a28e49ab9e8dd38af5482bbe57acbaf7bb5e'
    this.adminCapConditional = '0x3a37b161be51bd0429a15d4fbb8654e5c799293641a291c6a37ee337ceeb484b'
    // This is default treasury of sweepstake
    this.objectSweepStakeSui = '0x14cd45a896f3018029e6b0b57013a85360096c1f35225d6d1a0da5f252347874'

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
