// Request payloads for Subscriptions module

export function getNotePayload() {
  return {
    author: 'amine',
    message: 'test',
    description: 'test',
    serial_number: 'na',
    pinned: false,
    include_order_id: false
  };
}

export function getAutoRenewPayload(autoRenew) {
  return {
    auto_renew: autoRenew
  };
}

export function getConsumableSubscriptionPayload(orderId, id, productId, subscriptionStart) {
  return {
    order_id: orderId,
    id: id,
    product_id: productId,
    serial_number: `serial-${Date.now()}`,
    subscription_start: subscriptionStart,
    status: 'active'
  };
}

export function getNormalBundleSubscriptionPayload(orderId, id, productId, subscriptionStart, bundleItemId) {
  return {
    order_id: orderId,
    id: id,
    product_id: productId,
    serial_number: null,
    status: 'active',
    bundle_id: null,
    subscription_start: subscriptionStart,
    bundle_data: [
      {
        id: bundleItemId,
        serial_number: `bundle-sn-${Date.now()}-1`,
        frame_number: `frame-${Date.now()}-1`
      }
    ]
  };
}
