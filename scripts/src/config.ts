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
    this.shinamiPrivateKey='sui_testnet_0e45dbbb403f380943036c9bc168f895'

    this.moduleAddress = '0x457fec13c41751455f3558c273d0508ae7317324022dd7e153c5b6f9dee83e34'
    this.adminCapSweepTake = '0x5269c7da19f4ee2890e47e2dd83fcf10295aa4e92d268fe7b571f2d706502f76'
    this.adminCapConditional = '0xdf40dea55005423834c8e00dc5ad0aff62d0b31c55c49cb4096c786f7626819c'
    // This is default treasury of sweepstake
    this.objectSweepStakeSui = '0x600a1f329156312549763fd60d33bb6fe5a088cf5ae24f14bf346f6df9dfde84'

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
