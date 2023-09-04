import { Deposited } from "../../generated/EntryPoint/EntryPoint";
import { DepositedEntity } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleDeposited(event: Deposited): void {
  log.info("Event handleDeposited: account={}, totalDeposit={}", [
    event.params.account.toString(),
    event.params.totalDeposit.toString(),
  ]);

  const id = event.transaction.hash.toHex();
  let entity = new DepositedEntity(id);
  entity.account = event.params.account.toString();
  entity.totalDeposit = event.params.totalDeposit;
  entity.save();
}
