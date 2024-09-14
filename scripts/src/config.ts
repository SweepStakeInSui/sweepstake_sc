import * as dotenv from 'dotenv'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography'
import { EnokiClient } from '@mysten/enoki'

dotenv.config()

export class EnvConfig {
  network: 'testnet' | 'mainnet' | 'devnet' | 'localnet'
  privateKey: string
  moduleAddress: string
  adminCap: string
  objectSweepStakeSui: string
  userPrivateKey: string
  enokiKey: string

  // I dont know why my env vars are not being read so i set in this file :D ??
  constructor() {
    this.network = 'testnet'
    this.privateKey = 'suiprivkey1qqanr8rzh3uk2mkdprjz2gdledt5qx5c6692se559qeteza9qqduzgzn6y5'
    this.moduleAddress = '0xa3f6be9ca08f72631cf60b195262efdc98717d7517327958ff5f483e0a8cf224'
    this.adminCap = '0xf8d127071c2de63899c59a536f1c24c269a18f609e0f9f9559a4e9929e643374'
    this.objectSweepStakeSui = '0xc0295bab9d75c40e486e87fdf48c1fb4bd2d3dcdd032ffbee2d679646d67e8e6'
    this.userPrivateKey = 'suiprivkey1qr37ll8uquagxc3hwwtd9remne7z2lfs2nczflqp0f5htrqn2tf6ylv00pp'
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
