import {
  NewAdmin as NewAdminEvent,
  QuestionInitialized as QuestionInitializedEvent,
  RemovedAdmin as RemovedAdminEvent
} from "../generated/SweepstakeUma/SweepstakeUma"
import {
  NewAdmin,
  QuestionInitialized,
  RemovedAdmin
} from "../generated/schema"

export function handleNewAdmin(event: NewAdminEvent): void {
  let entity = new NewAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.admin = event.params.admin
  entity.newAdminAddress = event.params.newAdminAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuestionInitialized(
  event: QuestionInitializedEvent
): void {
  let entity = new QuestionInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.questionID = event.params.questionID
  entity.ancillaryData = event.params.ancillaryData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemovedAdmin(event: RemovedAdminEvent): void {
  let entity = new RemovedAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.admin = event.params.admin
  entity.removedAdmin = event.params.removedAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
