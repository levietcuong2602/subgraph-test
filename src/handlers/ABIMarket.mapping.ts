import { Sell, Buy, Cancel } from '../../generated/ABIMarket/ABIMarket';
import {
  SaleOrder,
  SaleOrderHistory,
  Token,
  User,
  TokenHistory,
  TransactionCounter,
} from '../../generated/schema';
// import { TRANSACTION_TYPE, TOKEN_ACTION } from "../constants";
import { BigInt, log } from '@graphprotocol/graph-ts';

export function handleSellSaleOrder(event: Sell): void {
  log.info(
    'Event Sell Sale Order: id={}, token={}, currency={}, seller={}, price={}',
    [
      event.params.orderId.toHex(),
      event.params.tokenId.toString(),
      event.params.currency.toHexString(),
      event.params.seller.toHexString(),
      event.params.price.toString(),
    ]
  );

  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenId = event.params.tokenId;
    token.tokenAddress = event.params.tokenAddress.toHexString();
    token.createdAtTimestamp = event.block.timestamp;
    token.save();
  }

  let seller = User.load(event.params.seller.toHexString());
  if (!seller) {
    seller = new User(event.params.seller.toHexString());
    seller.save();
  }

  // create sale order
  const id = event.transaction.hash.toHex();
  const orderId = event.params.orderId.toHex();
  const saleOrder = new SaleOrder(orderId);
  saleOrder.token = event.params.tokenId.toString();
  saleOrder.currency = event.params.currency.toHexString();
  saleOrder.seller = event.params.seller.toHexString();
  saleOrder.price = event.params.price;
  saleOrder.amount = event.params.amount;
  saleOrder.createdAtTimestamp = event.block.timestamp;
  saleOrder.updatedAtTimestamp = event.block.timestamp;
  saleOrder.onSale = true;
  saleOrder.save();

  // create sale order transaction
  const saleOrderHistory = new SaleOrderHistory(id);
  saleOrderHistory.order = event.params.orderId.toHex();
  saleOrderHistory.transactionType = 'Sell';
  saleOrderHistory.from = event.params.seller.toHexString();
  saleOrderHistory.amount = event.params.amount;
  saleOrderHistory.totalPrice = event.params.price.times(event.params.amount);
  saleOrderHistory.createdAtTimestamp = event.block.timestamp;
  saleOrderHistory.save();

  // create token history
  const tokenHistory = new TokenHistory(id);
  tokenHistory.actionType = 'Sell';
  tokenHistory.amount = event.params.amount;
  tokenHistory.from = event.params.seller.toHexString();
  tokenHistory.createdAtTimestamp = event.block.timestamp;
  tokenHistory.save();

  // calculate total transaction
  let transactionCounter = TransactionCounter.load('singleton');

  if (transactionCounter == null) {
    transactionCounter = new TransactionCounter('singleton');
    transactionCounter.total = BigInt.fromI32(0);
    transactionCounter.sell = BigInt.fromI32(0);
  }
  transactionCounter.total = transactionCounter.total.plus(BigInt.fromI32(1));
  transactionCounter.sell = transactionCounter.sell.plus(BigInt.fromI32(1));

  transactionCounter.save();
}

export function handleBuySaleOrder(event: Buy): void {
  log.info(
    'Event Buy Sale Order: id={}, token={}, currency={}, seller={}, price={}, amount={}',
    [
      event.params.orderId.toHex(),
      event.params.tokenId.toHexString(),
      event.params.currency.toHexString(),
      event.params.seller.toHexString(),
      event.params.price.toString(),
      event.params.amount.toString(),
    ]
  );
  // let token = Token.load(event.params.tokenId.toString());
  // log.info('token: tokenId={}', [event.params.tokenId.toString()]);
  // if (!token) {
  //   log.error('Token Id={} Not Found', [event.params.tokenId.toString()]);
  //   return;
  // }

  // let buyer = User.load(event.params.buyer.toHexString());
  // if (!buyer) {
  //   buyer = new User(event.params.buyer.toHexString());
  //   buyer.save();
  // }

  // const order = SaleOrder.load(event.params.orderId.toHex());
  // log.info('order: orderId={}', [event.params.orderId.toHex()]);
  // if (!order) {
  //   log.error('Order Id={} Not Found', [event.params.orderId.toString()]);
  //   return;
  // }

  // // update sale order
  // const remainAmount: BigInt = order.amount.minus(event.params.amount);
  // if (remainAmount.equals(new BigInt(0))) {
  //   order.onSale = false;
  // }
  // order.updatedAtTimestamp = event.block.timestamp;
  // order.amount = remainAmount;
  // order.save();
  // log.info('update order: tokenId={} success', [
  //   event.params.tokenId.toString(),
  // ]);
  // // create sale order transaction: Buy
  // const saleOrderHistory = new SaleOrderHistory(event.params.orderId.toHex());
  // saleOrderHistory.order = event.params.orderId.toHex();
  // saleOrderHistory.transactionType = 'Buy';
  // saleOrderHistory.from = event.params.seller.toHexString();
  // saleOrderHistory.to = event.params.buyer.toHexString();
  // saleOrderHistory.amount = event.params.amount;
  // saleOrderHistory.totalPrice = event.params.price.times(event.params.amount);
  // saleOrderHistory.pay = event.params.pay;
  // saleOrderHistory.createdAtTimestamp = event.block.timestamp;
  // saleOrderHistory.save();

  // // create token history
  // const id = event.transaction.hash.toHex();
  // const tokenHistory = new TokenHistory(id);
  // tokenHistory.actionType = 'Buy';
  // tokenHistory.amount = event.params.amount;
  // tokenHistory.from = event.params.seller.toHexString();
  // tokenHistory.to = event.params.buyer.toHexString();
  // tokenHistory.createdAtTimestamp = event.block.timestamp;
  // tokenHistory.save();

  // calculate total transaction
  let transactionCounter = TransactionCounter.load('singleton');

  if (transactionCounter == null) {
    transactionCounter = new TransactionCounter('singleton');
    transactionCounter.total = BigInt.fromI32(0);
    transactionCounter.buy = BigInt.fromI32(0);
  }
  transactionCounter.total = transactionCounter.total.plus(BigInt.fromI32(1));
  transactionCounter.buy = transactionCounter.buy.plus(BigInt.fromI32(1));

  transactionCounter.save();
}

export function handleCancelSaleOrder(event: Cancel): void {
  log.info(
    'Event Cancel Sale Order: id={}, token={}, currency={}, seller={}, price={}',
    [
      event.params.orderId.toHex(),
      event.params.tokenId.toString(),
      event.params.currency.toHexString(),
      event.params.seller.toHexString(),
      event.params.price.toString(),
    ]
  );
  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    log.error('Token Id={} Not Found', [event.params.tokenId.toString()]);
    return;
  }

  const order = SaleOrder.load(event.params.orderId.toHex());
  if (!order) {
    log.error('Order Id={} Not Found', [event.params.orderId.toString()]);
    return;
  }
  order.onSale = false;
  order.updatedAtTimestamp = event.block.timestamp;
  order.save();

  // create sale order transaction: Cancel
  const saleOrderHistory = new SaleOrderHistory(event.params.orderId.toHex());
  saleOrderHistory.order = event.params.orderId.toHex();
  saleOrderHistory.transactionType = 'Cancel';
  saleOrderHistory.from = event.params.seller.toHexString();
  saleOrderHistory.amount = order.amount;
  saleOrderHistory.totalPrice = event.params.price.times(order.amount);
  saleOrderHistory.createdAtTimestamp = event.block.timestamp;
  saleOrderHistory.save();

  // create token history
  const id = event.transaction.hash.toHex();
  const tokenHistory = new TokenHistory(id);
  tokenHistory.actionType = 'Cancel';
  tokenHistory.amount = order.amount;
  tokenHistory.from = event.params.seller.toHexString();
  tokenHistory.createdAtTimestamp = event.block.timestamp;
  tokenHistory.save();

  // calculate total transaction
  let transactionCounter = TransactionCounter.load('singleton');

  if (transactionCounter == null) {
    transactionCounter = new TransactionCounter('singleton');
    transactionCounter.total = BigInt.fromI32(0);
    transactionCounter.cancel = BigInt.fromI32(0);
  }
  transactionCounter.total = transactionCounter.total.plus(BigInt.fromI32(1));
  transactionCounter.cancel = transactionCounter.cancel.plus(BigInt.fromI32(1));

  transactionCounter.save();
}
