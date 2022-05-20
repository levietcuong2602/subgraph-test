import { Sell, Buy, Cancel } from "../generated/ABIMarket/ABIMarket";
import {
  SaleOrder,
  SaleOrderTransaction,
  Token,
  User,
} from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleSellSaleOrder(event: Sell): void {
  log.info(
    "Event Sell Sale Order: id={}, token={}, currency={}, seller={}, price={}",
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
  const saleOrderTransaction = new SaleOrderTransaction(id);
  saleOrderTransaction.order = event.params.orderId.toHex();
  saleOrderTransaction.transactionType = "Sell";
  saleOrderTransaction.from = event.params.seller.toHexString();
  saleOrderTransaction.amount = event.params.amount;
  saleOrderTransaction.totalPrice = event.params.price.times(
    event.params.amount
  );
  saleOrderTransaction.createdAtTimestamp = event.block.timestamp;
  saleOrderTransaction.save();
}

export function handleBuySaleOrder(event: Buy): void {
  log.info(
    "Event Buy Sale Order: id={}, token={}, currency={}, seller={}, price={}, amount={}",
    [
      event.params.orderId.toHex(),
      event.params.tokenId.toHexString(),
      event.params.currency.toHexString(),
      event.params.seller.toHexString(),
      event.params.price.toString(),
      event.params.amount.toString(),
    ]
  );
  let token = Token.load(event.params.tokenId.toString());
  log.info("token: tokenId={}", [event.params.tokenId.toString()]);
  if (!token) {
    log.error("Token Id={} Not Found", [event.params.tokenId.toString()]);
    return;
  }

  let buyer = User.load(event.params.buyer.toHexString());
  if (!buyer) {
    buyer = new User(event.params.buyer.toHexString());
    buyer.save();
  }

  const order = SaleOrder.load(event.params.orderId.toHex());
  log.info("order: orderId={}", [event.params.orderId.toString()]);
  if (!order) {
    log.error("Order Id={} Not Found", [event.params.orderId.toString()]);
    return;
  }

  // update sale order
  const remainAmount: BigInt = order.amount.minus(event.params.amount);
  if (remainAmount.equals(new BigInt(0))) {
    order.onSale = false;
  }
  order.updatedAtTimestamp = event.block.timestamp;
  order.amount = remainAmount;
  order.save();
  log.info("update order: tokenId={} success", [
    event.params.tokenId.toString(),
  ]);
  // create sale order transaction: Buy
  const saleOrderTransaction = new SaleOrderTransaction(
    event.params.orderId.toHex()
  );
  saleOrderTransaction.order = event.params.orderId.toHex();
  saleOrderTransaction.transactionType = "Buy";
  saleOrderTransaction.from = event.params.seller.toHexString();
  saleOrderTransaction.to = event.params.buyer.toHexString();
  saleOrderTransaction.amount = event.params.amount;
  saleOrderTransaction.totalPrice = event.params.price.times(
    event.params.amount
  );
  saleOrderTransaction.pay = event.params.pay;
  saleOrderTransaction.createdAtTimestamp = event.block.timestamp;
  saleOrderTransaction.save();
}

export function handleCancelSaleOrder(event: Cancel): void {
  log.info(
    "Event Cancel Sale Order: id={}, token={}, currency={}, seller={}, price={}",
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
    log.error("Token Id={} Not Found", [event.params.tokenId.toString()]);
    return;
  }

  const order = SaleOrder.load(event.params.orderId.toHex());
  if (!order) {
    log.error("Order Id={} Not Found", [event.params.orderId.toString()]);
    return;
  }
  order.onSale = false;
  order.updatedAtTimestamp = event.block.timestamp;
  order.save();

  // create sale order transaction: Cancel
  const saleOrderTransaction = new SaleOrderTransaction(
    event.params.orderId.toHex()
  );
  saleOrderTransaction.order = event.params.orderId.toHex();
  saleOrderTransaction.transactionType = "Cancel";
  saleOrderTransaction.from = event.params.seller.toHexString();
  saleOrderTransaction.amount = order.amount;
  saleOrderTransaction.totalPrice = event.params.price.times(order.amount);
  saleOrderTransaction.createdAtTimestamp = event.block.timestamp;
  saleOrderTransaction.save();
}
