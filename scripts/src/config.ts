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

    this.moduleAddress = '0x35e1e64ef2ef78b4ff4582d307afcb95913616abfe8b6a42a7fc30d864f025a'
    this.adminCapSweepTake = '0xd9283ceaa0280433a0df326a575135693b0dd915759682752f0f071be1744ff2'
    this.adminCapConditional = '0x6c2b67414c12f6bc8e4ebbdad5e8a5dd98b41f9a6cd3ca5d5fd4b36cabe0abfe'
    // This is default treasury of sweepstake
    this.objectSweepStakeSui = '0xe963c8760a403b6e044b2ffaea0f69397610a21bcadabaa7170b8f137a7323fe'

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
