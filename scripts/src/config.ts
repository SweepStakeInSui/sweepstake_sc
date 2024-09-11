import * as dotenv from 'dotenv'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography'
import { EnokiClient } from "@mysten/enoki";

dotenv.config()

export class EnvConfig {
  network: 'testnet' | 'mainnet' | 'devnet' | 'localnet'
  privateKey: string
  moduleAddress: string
  adminCap: string
  objectSweepStakeSui: string
  userPrivateKey: string
  enokiKey: string

  constructor() {
    this.network = 'testnet'
    this.privateKey = 'suiprivkey1qr37ll8uquagxc3hwwtd9remne7z2lfs2nczflqp0f5htrqn2tf6ylv00pp'
    this.moduleAddress = '0x3de40c6a37d2069df0c5c92580f112b47fd82a5e3e9bae1eb00c87f6f87b72fb'
    this.adminCap = '0xd982a966d49f090a8065cb45f4d1598bda4787a5e6da9655102b8312334fb983'
    this.objectSweepStakeSui = '0x5eb5a9f77fdb18b46e219f438c515b72838bb47b987f8aa0b2019bf44100998d'
    this.userPrivateKey = 'suiprivkey1qqanr8rzh3uk2mkdprjz2gdledt5qx5c6692se559qeteza9qqduzgzn6y5'
    this.enokiKey = 'enoki_private_703b6123789a3d4279e4c59ec3fb96bb'
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
  enokiClient: EnokiClient
  moduleAddress: string
  admin: Ed25519Keypair
  user: Ed25519Keypair
  adminCap: string
  objectSweepStakeSui: string

  constructor(config: EnvConfig) {
    this.enokiClient = new EnokiClient({
      apiKey: config.enokiKey,
    })
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') })
    this.moduleAddress = config.moduleAddress
    this.admin = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(config.privateKey).secretKey)
    this.user = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(config.userPrivateKey).secretKey)
    this.adminCap = config.adminCap
    this.objectSweepStakeSui = config.objectSweepStakeSui
  }
}

export function createAppConfig(): AppConfig {
  const envConfig = new EnvConfig()
  return new AppConfig(envConfig)
}
