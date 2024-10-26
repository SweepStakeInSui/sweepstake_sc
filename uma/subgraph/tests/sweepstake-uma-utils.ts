import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  NewAdmin,
  QuestionInitialized,
  RemovedAdmin
} from "../generated/SweepstakeUma/SweepstakeUma"

export function createNewAdminEvent(
  admin: Address,
  newAdminAddress: Address
): NewAdmin {
  let newAdminEvent = changetype<NewAdmin>(newMockEvent())

  newAdminEvent.parameters = new Array()

  newAdminEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  newAdminEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminAddress",
      ethereum.Value.fromAddress(newAdminAddress)
    )
  )

  return newAdminEvent
}

export function createQuestionInitializedEvent(
  questionID: Bytes,
  ancillaryData: Bytes
): QuestionInitialized {
  let questionInitializedEvent = changetype<QuestionInitialized>(newMockEvent())

  questionInitializedEvent.parameters = new Array()

  questionInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "questionID",
      ethereum.Value.fromFixedBytes(questionID)
    )
  )
  questionInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "ancillaryData",
      ethereum.Value.fromBytes(ancillaryData)
    )
  )

  return questionInitializedEvent
}

export function createRemovedAdminEvent(
  admin: Address,
  removedAdmin: Address
): RemovedAdmin {
  let removedAdminEvent = changetype<RemovedAdmin>(newMockEvent())

  removedAdminEvent.parameters = new Array()

  removedAdminEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  removedAdminEvent.parameters.push(
    new ethereum.EventParam(
      "removedAdmin",
      ethereum.Value.fromAddress(removedAdmin)
    )
  )

  return removedAdminEvent
}
