import { Sell, Buy, Cancel } from '../generated/ABIMarket/ABIMarket'
import { SaleOrder, SaleOrderTransaction, Token, User } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts';

export function handleSellSaleOrder(event: Sell): void {
  log.info('Event Sell Sale Order', [])
  const token = Token.load(event.params.tokenId.toString());
  if (!token) return;

  // create sale order
  const id = event.transaction.hash.toHex()
  const orderId = event.params.orderId.toHex();
  const saleOrder = new SaleOrder(orderId)
  saleOrder.token = event.params.tokenId.toHexString()
  saleOrder.currency = event.params.currency.toHexString()
  saleOrder.seller = event.params.seller.toHexString()
  saleOrder.price = event.params.price
  saleOrder.amount = event.params.amount
  saleOrder.createdAtTimestamp = event.block.timestamp;
  saleOrder.updatedAtTimestamp = event.block.timestamp;
  saleOrder.save();

  // create sale order transaction
  const saleOrderTransaction = new SaleOrderTransaction(id);
  saleOrderTransaction.order = event.params.orderId.toHexString()
  saleOrderTransaction.transactionType = "Sell"
  saleOrderTransaction.from = event.params.seller.toHexString()
  saleOrderTransaction.amount = event.params.amount
  saleOrderTransaction.totalPrice = event.params.price.times(event.params.amount);
  saleOrderTransaction.createdAtTimestamp = event.block.timestamp;
  saleOrderTransaction.save();

  // check user exists
  let seller = User.load(event.params.seller.toHexString());
  if (!seller) {
    seller = new User(event.params.seller.toHexString());
    seller.save();
  }
}

export function handleBuySaleOrder(event: Buy): void {
  log.info('Event Buy Sale Order', [])
}

export function handleCancelSaleOrder(event: Cancel): void {
  log.info('Event Sell Sale Order', [])
}
