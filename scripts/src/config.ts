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
  adminCapSweepStake: string
  adminCapConditional: string
  objectSweepStakeSui: string
  userPrivateKey: string
  shinamiPrivateKey: string

  constructor() {
    this.network = process.env.NETWORK as 'testnet' | 'mainnet' | 'devnet' | 'localnet'
    this.privateKey = this.getEnvVarOrPanic('PRIVATE_KEY')
    this.shinamiPrivateKey = this.getEnvVarOrPanic('SHINAMI_PRIVATE_KEY')

    this.moduleAddress = this.getEnvVarOrPanic('MODULE_ADDRESS')
    this.adminCapSweepStake = this.getEnvVarOrPanic('ADMIN_CAP_SWEEPSTAKE')
    this.adminCapConditional = this.getEnvVarOrPanic('ADMIN_CAP_CONDITIONAL')
    this.objectSweepStakeSui = this.getEnvVarOrPanic('OBJECT_SWEEPSTAKE_SUI')

    this.userPrivateKey = this.getEnvVarOrPanic('USER_PRIVATE_KEY')
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
    this.adminCapSweepTake = config.adminCapSweepStake
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
