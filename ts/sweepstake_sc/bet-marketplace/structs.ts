import { String } from '../../_dependencies/source/0x1/string/structs'
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeStr,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  phantom,
} from '../../_framework/reified'
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
  parseTypeName,
} from '../../_framework/util'
import { Balance } from '../../sui/balance/structs'
import { UID } from '../../sui/object/structs'
import { PKG_V1 } from '../index'
import { bcs } from '@mysten/sui/bcs'
import { SuiClient, SuiObjectData, SuiParsedData } from '@mysten/sui/client'
import { fromB64 } from '@mysten/sui/utils'

/* ============================== AdminCap =============================== */

export function isAdminCap(type: string): boolean {
  type = compressSuiType(type)
  return type === `${PKG_V1}::bet_marketplace::AdminCap`
}

export interface AdminCapFields {
  id: ToField<UID>
}

export type AdminCapReified = Reified<AdminCap, AdminCapFields>

export class AdminCap implements StructClass {
  __StructClass = true as const

  static readonly $typeName = `${PKG_V1}::bet_marketplace::AdminCap`
  static readonly $numTypeParams = 0
  static readonly $isPhantom = [] as const

  readonly $typeName = AdminCap.$typeName
  readonly $fullTypeName: `${typeof PKG_V1}::bet_marketplace::AdminCap`
  readonly $typeArgs: []
  readonly $isPhantom = AdminCap.$isPhantom

  readonly id: ToField<UID>

  private constructor(typeArgs: [], fields: AdminCapFields) {
    this.$fullTypeName = composeSuiType(
      AdminCap.$typeName,
      ...typeArgs
    ) as `${typeof PKG_V1}::bet_marketplace::AdminCap`
    this.$typeArgs = typeArgs

    this.id = fields.id
  }

  static reified(): AdminCapReified {
    return {
      typeName: AdminCap.$typeName,
      fullTypeName: composeSuiType(
        AdminCap.$typeName,
        ...[]
      ) as `${typeof PKG_V1}::bet_marketplace::AdminCap`,
      typeArgs: [] as [],
      isPhantom: AdminCap.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => AdminCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => AdminCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => AdminCap.fromBcs(data),
      bcs: AdminCap.bcs,
      fromJSONField: (field: any) => AdminCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => AdminCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => AdminCap.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => AdminCap.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => AdminCap.fetch(client, id),
      new: (fields: AdminCapFields) => {
        return new AdminCap([], fields)
      },
      kind: 'StructClassReified',
    }
  }

  static get r() {
    return AdminCap.reified()
  }

  static phantom(): PhantomReified<ToTypeStr<AdminCap>> {
    return phantom(AdminCap.reified())
  }
  static get p() {
    return AdminCap.phantom()
  }

  static get bcs() {
    return bcs.struct('AdminCap', {
      id: UID.bcs,
    })
  }

  static fromFields(fields: Record<string, any>): AdminCap {
    return AdminCap.reified().new({ id: decodeFromFields(UID.reified(), fields.id) })
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): AdminCap {
    if (!isAdminCap(item.type)) {
      throw new Error('not a AdminCap type')
    }

    return AdminCap.reified().new({ id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id) })
  }

  static fromBcs(data: Uint8Array): AdminCap {
    return AdminCap.fromFields(AdminCap.bcs.parse(data))
  }

  toJSONField() {
    return {
      id: this.id,
    }
  }

  toJSON() {
    return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() }
  }

  static fromJSONField(field: any): AdminCap {
    return AdminCap.reified().new({ id: decodeFromJSONField(UID.reified(), field.id) })
  }

  static fromJSON(json: Record<string, any>): AdminCap {
    if (json.$typeName !== AdminCap.$typeName) {
      throw new Error('not a WithTwoGenerics json object')
    }

    return AdminCap.fromJSONField(json)
  }

  static fromSuiParsedData(content: SuiParsedData): AdminCap {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object')
    }
    if (!isAdminCap(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a AdminCap object`)
    }
    return AdminCap.fromFieldsWithTypes(content)
  }

  static fromSuiObjectData(data: SuiObjectData): AdminCap {
    if (data.bcs) {
      if (data.bcs.dataType !== 'moveObject' || !isAdminCap(data.bcs.type)) {
        throw new Error(`object at is not a AdminCap object`)
      }

      return AdminCap.fromBcs(fromB64(data.bcs.bcsBytes))
    }
    if (data.content) {
      return AdminCap.fromSuiParsedData(data.content)
    }
    throw new Error(
      'Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.'
    )
  }

  static async fetch(client: SuiClient, id: string): Promise<AdminCap> {
    const res = await client.getObject({ id, options: { showBcs: true } })
    if (res.error) {
      throw new Error(`error fetching AdminCap object at id ${id}: ${res.error.code}`)
    }
    if (res.data?.bcs?.dataType !== 'moveObject' || !isAdminCap(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a AdminCap object`)
    }

    return AdminCap.fromSuiObjectData(res.data)
  }
}

/* ============================== Deposit =============================== */

export function isDeposit(type: string): boolean {
  type = compressSuiType(type)
  return type === `${PKG_V1}::bet_marketplace::Deposit`
}

export interface DepositFields {
  coin: ToField<String>
  amount: ToField<'u64'>
}

export type DepositReified = Reified<Deposit, DepositFields>

export class Deposit implements StructClass {
  __StructClass = true as const

  static readonly $typeName = `${PKG_V1}::bet_marketplace::Deposit`
  static readonly $numTypeParams = 0
  static readonly $isPhantom = [] as const

  readonly $typeName = Deposit.$typeName
  readonly $fullTypeName: `${typeof PKG_V1}::bet_marketplace::Deposit`
  readonly $typeArgs: []
  readonly $isPhantom = Deposit.$isPhantom

  readonly coin: ToField<String>
  readonly amount: ToField<'u64'>

  private constructor(typeArgs: [], fields: DepositFields) {
    this.$fullTypeName = composeSuiType(
      Deposit.$typeName,
      ...typeArgs
    ) as `${typeof PKG_V1}::bet_marketplace::Deposit`
    this.$typeArgs = typeArgs

    this.coin = fields.coin
    this.amount = fields.amount
  }

  static reified(): DepositReified {
    return {
      typeName: Deposit.$typeName,
      fullTypeName: composeSuiType(
        Deposit.$typeName,
        ...[]
      ) as `${typeof PKG_V1}::bet_marketplace::Deposit`,
      typeArgs: [] as [],
      isPhantom: Deposit.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Deposit.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Deposit.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Deposit.fromBcs(data),
      bcs: Deposit.bcs,
      fromJSONField: (field: any) => Deposit.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Deposit.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) => Deposit.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) => Deposit.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Deposit.fetch(client, id),
      new: (fields: DepositFields) => {
        return new Deposit([], fields)
      },
      kind: 'StructClassReified',
    }
  }

  static get r() {
    return Deposit.reified()
  }

  static phantom(): PhantomReified<ToTypeStr<Deposit>> {
    return phantom(Deposit.reified())
  }
  static get p() {
    return Deposit.phantom()
  }

  static get bcs() {
    return bcs.struct('Deposit', {
      coin: String.bcs,
      amount: bcs.u64(),
    })
  }

  static fromFields(fields: Record<string, any>): Deposit {
    return Deposit.reified().new({
      coin: decodeFromFields(String.reified(), fields.coin),
      amount: decodeFromFields('u64', fields.amount),
    })
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Deposit {
    if (!isDeposit(item.type)) {
      throw new Error('not a Deposit type')
    }

    return Deposit.reified().new({
      coin: decodeFromFieldsWithTypes(String.reified(), item.fields.coin),
      amount: decodeFromFieldsWithTypes('u64', item.fields.amount),
    })
  }

  static fromBcs(data: Uint8Array): Deposit {
    return Deposit.fromFields(Deposit.bcs.parse(data))
  }

  toJSONField() {
    return {
      coin: this.coin,
      amount: this.amount.toString(),
    }
  }

  toJSON() {
    return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() }
  }

  static fromJSONField(field: any): Deposit {
    return Deposit.reified().new({
      coin: decodeFromJSONField(String.reified(), field.coin),
      amount: decodeFromJSONField('u64', field.amount),
    })
  }

  static fromJSON(json: Record<string, any>): Deposit {
    if (json.$typeName !== Deposit.$typeName) {
      throw new Error('not a WithTwoGenerics json object')
    }

    return Deposit.fromJSONField(json)
  }

  static fromSuiParsedData(content: SuiParsedData): Deposit {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object')
    }
    if (!isDeposit(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Deposit object`)
    }
    return Deposit.fromFieldsWithTypes(content)
  }

  static fromSuiObjectData(data: SuiObjectData): Deposit {
    if (data.bcs) {
      if (data.bcs.dataType !== 'moveObject' || !isDeposit(data.bcs.type)) {
        throw new Error(`object at is not a Deposit object`)
      }

      return Deposit.fromBcs(fromB64(data.bcs.bcsBytes))
    }
    if (data.content) {
      return Deposit.fromSuiParsedData(data.content)
    }
    throw new Error(
      'Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.'
    )
  }

  static async fetch(client: SuiClient, id: string): Promise<Deposit> {
    const res = await client.getObject({ id, options: { showBcs: true } })
    if (res.error) {
      throw new Error(`error fetching Deposit object at id ${id}: ${res.error.code}`)
    }
    if (res.data?.bcs?.dataType !== 'moveObject' || !isDeposit(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Deposit object`)
    }

    return Deposit.fromSuiObjectData(res.data)
  }
}

/* ============================== Sweepstake =============================== */

export function isSweepstake(type: string): boolean {
  type = compressSuiType(type)
  return type.startsWith(`${PKG_V1}::bet_marketplace::Sweepstake` + '<')
}

export interface SweepstakeFields<T extends PhantomTypeArgument> {
  id: ToField<UID>
  balance: ToField<Balance<T>>
}

export type SweepstakeReified<T extends PhantomTypeArgument> = Reified<
  Sweepstake<T>,
  SweepstakeFields<T>
>

export class Sweepstake<T extends PhantomTypeArgument> implements StructClass {
  __StructClass = true as const

  static readonly $typeName = `${PKG_V1}::bet_marketplace::Sweepstake`
  static readonly $numTypeParams = 1
  static readonly $isPhantom = [true] as const

  readonly $typeName = Sweepstake.$typeName
  readonly $fullTypeName: `${typeof PKG_V1}::bet_marketplace::Sweepstake<${PhantomToTypeStr<T>}>`
  readonly $typeArgs: [PhantomToTypeStr<T>]
  readonly $isPhantom = Sweepstake.$isPhantom

  readonly id: ToField<UID>
  readonly balance: ToField<Balance<T>>

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: SweepstakeFields<T>) {
    this.$fullTypeName = composeSuiType(
      Sweepstake.$typeName,
      ...typeArgs
    ) as `${typeof PKG_V1}::bet_marketplace::Sweepstake<${PhantomToTypeStr<T>}>`
    this.$typeArgs = typeArgs

    this.id = fields.id
    this.balance = fields.balance
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): SweepstakeReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Sweepstake.$typeName,
      fullTypeName: composeSuiType(
        Sweepstake.$typeName,
        ...[extractType(T)]
      ) as `${typeof PKG_V1}::bet_marketplace::Sweepstake<${PhantomToTypeStr<ToPhantomTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [PhantomToTypeStr<ToPhantomTypeArgument<T>>],
      isPhantom: Sweepstake.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Sweepstake.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) => Sweepstake.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Sweepstake.fromBcs(T, data),
      bcs: Sweepstake.bcs,
      fromJSONField: (field: any) => Sweepstake.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Sweepstake.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) => Sweepstake.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) => Sweepstake.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) => Sweepstake.fetch(client, T, id),
      new: (fields: SweepstakeFields<ToPhantomTypeArgument<T>>) => {
        return new Sweepstake([extractType(T)], fields)
      },
      kind: 'StructClassReified',
    }
  }

  static get r() {
    return Sweepstake.reified
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T
  ): PhantomReified<ToTypeStr<Sweepstake<ToPhantomTypeArgument<T>>>> {
    return phantom(Sweepstake.reified(T))
  }
  static get p() {
    return Sweepstake.phantom
  }

  static get bcs() {
    return bcs.struct('Sweepstake', {
      id: UID.bcs,
      balance: Balance.bcs,
    })
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    return Sweepstake.reified(typeArg).new({
      id: decodeFromFields(UID.reified(), fields.id),
      balance: decodeFromFields(Balance.reified(typeArg), fields.balance),
    })
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    if (!isSweepstake(item.type)) {
      throw new Error('not a Sweepstake type')
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg])

    return Sweepstake.reified(typeArg).new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      balance: decodeFromFieldsWithTypes(Balance.reified(typeArg), item.fields.balance),
    })
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    return Sweepstake.fromFields(typeArg, Sweepstake.bcs.parse(data))
  }

  toJSONField() {
    return {
      id: this.id,
      balance: this.balance.toJSONField(),
    }
  }

  toJSON() {
    return { $typeName: this.$typeName, $typeArgs: this.$typeArgs, ...this.toJSONField() }
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    return Sweepstake.reified(typeArg).new({
      id: decodeFromJSONField(UID.reified(), field.id),
      balance: decodeFromJSONField(Balance.reified(typeArg), field.balance),
    })
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Sweepstake.$typeName) {
      throw new Error('not a WithTwoGenerics json object')
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(Sweepstake.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg]
    )

    return Sweepstake.fromJSONField(typeArg, json)
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object')
    }
    if (!isSweepstake(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Sweepstake object`)
    }
    return Sweepstake.fromFieldsWithTypes(typeArg, content)
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData
  ): Sweepstake<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== 'moveObject' || !isSweepstake(data.bcs.type)) {
        throw new Error(`object at is not a Sweepstake object`)
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs
      if (gotTypeArgs.length !== 1) {
        throw new Error(
          `type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`
        )
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0])
      const expectedTypeArg = compressSuiType(extractType(typeArg))
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(
          `type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`
        )
      }

      return Sweepstake.fromBcs(typeArg, fromB64(data.bcs.bcsBytes))
    }
    if (data.content) {
      return Sweepstake.fromSuiParsedData(typeArg, data.content)
    }
    throw new Error(
      'Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.'
    )
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string
  ): Promise<Sweepstake<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } })
    if (res.error) {
      throw new Error(`error fetching Sweepstake object at id ${id}: ${res.error.code}`)
    }
    if (res.data?.bcs?.dataType !== 'moveObject' || !isSweepstake(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Sweepstake object`)
    }

    return Sweepstake.fromSuiObjectData(typeArg, res.data)
  }
}
