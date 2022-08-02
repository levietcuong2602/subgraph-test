import {
  ConvertToGame,
  OpenBox,
  SendClaim,
  ConvertToChain,
  SendOpenBoxReward,
} from '../../generated/ABIOperator/ABIOperator';
import { TokenHistory, Token, UserCounter } from '../../generated/schema';
import { BigInt, log } from '@graphprotocol/graph-ts';

export function handleConvertToChain(event: ConvertToChain): void {
  log.info(
    'Event Convert To Chain: tokenAddress={}, tokenId={}, froms={}, tos={}, amounts={}',
    [
      event.params.tokenAddress.toHex(),
      event.params.tokenId.toString(),
      event.params.froms.toString(),
      event.params.tos.toString(),
      event.params.amounts.toString(),
    ]
  );
  let token = Token.load(event.params.tokenId.toString());
  log.info('token: tokenId={}', [event.params.tokenId.toString()]);
  if (!token) {
    log.error('Token Id={} Not Found', [event.params.tokenId.toString()]);
    return;
  }

  for (let i = 0; i < event.params.froms.length; i++) {
    const tokenHistory = new TokenHistory(
      event.transaction.hash.toHex() + i.toString()
    );
    tokenHistory.actionType = 'ConvertToChain';
    tokenHistory.token = event.params.tokenId.toString();
    tokenHistory.amount = event.params.amounts[i];
    tokenHistory.from = event.params.froms[i].toHexString();
    tokenHistory.to = event.params.tos[i].toHexString();
    tokenHistory.createdAtTimestamp = event.block.timestamp;
    tokenHistory.save();

    // calculate total transaction of user
    let userCounter = UserCounter.load(event.params.froms[i].toHexString());

    if (userCounter == null) {
      userCounter = new UserCounter(event.params.froms[i].toHexString());
      userCounter.totalTransaction = BigInt.fromI32(0);
    }
    userCounter.totalTransaction = userCounter.totalTransaction.plus(
      BigInt.fromI32(1)
    );

    userCounter.save();
  }
}

// TODO field froms
export function handleSendClaim(event: SendClaim): void {
  log.info(
    'Event Send Claim: tokenAddress={}, tokenId={}, froms={}, tos={}, amounts={}',
    [
      event.params.tokenAddress.toHex(),
      event.params.tokenId.toString(),
      event.params.froms.toString(),
      event.params.tos.toString(),
      event.params.amounts.toString(),
    ]
  );

  let token = Token.load(event.params.tokenId.toString());
  log.info('token: tokenId={}', [event.params.tokenId.toString()]);
  if (!token) {
    log.error('Token Id={} Not Found', [event.params.tokenId.toString()]);
    return;
  }

  for (let i = 0; i < event.params.tos.length; i++) {
    const tokenHistory = new TokenHistory(
      event.transaction.hash.toHex() + i.toString()
    );
    tokenHistory.actionType = 'SendClaim';
    tokenHistory.token = event.params.tokenId.toString();
    tokenHistory.amount = event.params.amounts[i];
    tokenHistory.from = event.params.froms[i].toHexString();
    tokenHistory.to = event.params.tos[i].toHexString();
    tokenHistory.createdAtTimestamp = event.block.timestamp;
    tokenHistory.save();

    // calculate total transaction of user
    let userCounter = UserCounter.load(event.params.froms[i].toHexString());

    if (userCounter == null) {
      userCounter = new UserCounter(event.params.froms[i].toHexString());
      userCounter.totalTransaction = BigInt.fromI32(0);
    }
    userCounter.totalTransaction = userCounter.totalTransaction.plus(
      BigInt.fromI32(1)
    );

    userCounter.save();
  }
}

export function handleConvertToGame(event: ConvertToGame): void {
  log.info('Event Burn Swap: tokenAddress={}, from={}, amount={}', [
    event.params.tokenAddress.toHex(),
    event.params.from.toHex(),
    event.params.amount.toString(),
  ]);

  const id = event.transaction.hash.toHex();
  const tokenHistory = new TokenHistory(id);
  tokenHistory.actionType = 'ConvertToGame';
  tokenHistory.amount = event.params.amount;
  tokenHistory.token = event.params.tokenId.toString();
  tokenHistory.from = event.params.from.toHexString();
  tokenHistory.createdAtTimestamp = event.block.timestamp;
  tokenHistory.save();

  // calculate total transaction of user
  let userCounter = UserCounter.load(event.params.from.toHex());

  if (userCounter == null) {
    userCounter = new UserCounter(event.params.from.toHex());
    userCounter.totalTransaction = BigInt.fromI32(0);
  }
  userCounter.totalTransaction = userCounter.totalTransaction.plus(
    BigInt.fromI32(1)
  );

  userCounter.save();
}

export function handleOpenBox(event: OpenBox): void {
  log.info('Event Open Box: tokenAddress={}, tokenId={}, from={}, amount={}', [
    event.params.tokenAddress.toHex(),
    event.params.tokenId.toString(),
    event.params.user.toHexString(),
    event.params.amount.toString(),
  ]);

  let token = Token.load(event.params.tokenId.toString());
  log.info('token: tokenId={}', [event.params.tokenId.toString()]);
  if (!token) {
    log.error('Token Id={} Not Found', [event.params.tokenId.toString()]);
    return;
  }

  const id = event.transaction.hash.toHex();
  const tokenHistory = new TokenHistory(id);
  tokenHistory.actionType = 'OpenBox';
  tokenHistory.amount = event.params.amount;
  tokenHistory.token = event.params.tokenId.toString();
  tokenHistory.from = event.params.user.toHexString();
  tokenHistory.createdAtTimestamp = event.block.timestamp;
  tokenHistory.save();
}

export function handleSendOpenBoxReward(event: SendOpenBoxReward): void {
  log.info('Event Open Box: tokenAddress={}, tokenId={}, from={}, amount={}', [
    event.params.tokenAddresses.toString(),
    event.params.tokenIds.toString(),
    event.params.froms.toString(),
    event.params.to.toHexString(),
    event.params.amounts.toString(),
  ]);

  for (let i = 0; i < event.params.tokenAddresses.length; i++) {
    let token = Token.load(event.params.tokenIds[i].toString());
    log.info('token: tokenId={}', [event.params.tokenIds[i].toString()]);
    if (!token) {
      log.error('Token Id={} Not Found', [event.params.tokenIds[i].toString()]);
      return;
    }

    const tokenHistory = new TokenHistory(
      event.transaction.hash.toHex() + i.toString()
    );
    tokenHistory.actionType = 'SendOpenBoxReward';
    tokenHistory.token = event.params.tokenIds[i].toString();
    tokenHistory.amount = event.params.amounts[i];
    tokenHistory.from = event.params.froms[i].toHexString();
    tokenHistory.to = event.params.to.toHexString();
    tokenHistory.createdAtTimestamp = event.block.timestamp;
    tokenHistory.save();
  }
}
