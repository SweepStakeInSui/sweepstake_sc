import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { NewAdmin } from "../generated/schema"
import { NewAdmin as NewAdminEvent } from "../generated/SweepstakeUma/SweepstakeUma"
import { handleNewAdmin } from "../src/sweepstake-uma"
import { createNewAdminEvent } from "./sweepstake-uma-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let admin = Address.fromString("0x0000000000000000000000000000000000000001")
    let newAdminAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newNewAdminEvent = createNewAdminEvent(admin, newAdminAddress)
    handleNewAdmin(newNewAdminEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("NewAdmin created and stored", () => {
    assert.entityCount("NewAdmin", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "NewAdmin",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "admin",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NewAdmin",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newAdminAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
