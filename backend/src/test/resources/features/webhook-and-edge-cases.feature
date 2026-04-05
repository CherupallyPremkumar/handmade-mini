Feature: Razorpay Webhooks & Edge Cases
  Webhook signature verification, concurrent stock, optimistic locking

  Background:
    Given the following products exist:
      | name          | fabric | weaveType | color | sellingPrice | mrp    | stock | gstPct |
      | Webhook Saree | SILK   | IKAT      | Blue  | 100000       | 150000 | 10    | 5      |

  # ─── Razorpay Webhook Signature Verification ───

  Scenario: Valid webhook signature is accepted
    Given I am logged in as "wh1@test.com" with password "Secret@123"
    And I have placed an order for "Webhook Saree" quantity 1
    When I send a Razorpay webhook "payment.captured" with valid signature
    Then the response status is 200
    And the order status is now "PAID"

  Scenario: Invalid webhook signature is rejected
    When I send a Razorpay webhook "payment.captured" with invalid signature
    Then the response status is 400
    And the response error contains "Invalid signature"

  Scenario: Missing webhook signature is rejected
    When I send a Razorpay webhook "payment.captured" without signature
    Then the response status is 400

  Scenario: payment.failed webhook marks order as failed
    Given I am logged in as "wh2@test.com" with password "Secret@123"
    And I have placed an order for "Webhook Saree" quantity 1
    When I send a Razorpay webhook "payment.failed" with valid signature
    Then the response status is 200
    And the order payment status is "failed"

  # ─── Concurrent Stock Decrement ───

  Scenario: Two simultaneous orders for last 2 items - first succeeds second fails
    Given I am logged in as "race1@test.com" with password "Secret@123"
    And product "Webhook Saree" has stock 10
    When I create an order with auth for:
      | productName   | quantity |
      | Webhook Saree | 9        |
    Then the response status is 200
    And product "Webhook Saree" now has stock 1
    When I create an order with auth for:
      | productName   | quantity |
      | Webhook Saree | 2        |
    Then the response status is 409
    And the response error contains "Insufficient stock"

  # ─── Optimistic Lock on Product Update ───

  Scenario: Atomic stock decrement prevents negative stock
    Given I am logged in as "atomic@test.com" with password "Secret@123"
    When I create an order with auth for:
      | productName   | quantity |
      | Webhook Saree | 10       |
    Then the response status is 200
    And product "Webhook Saree" now has stock 0
    When I create an order with auth for:
      | productName   | quantity |
      | Webhook Saree | 1        |
    Then the response status is 409

  # ─── Order not linked to wrong Razorpay ID ───

  Scenario: Malformed JSON webhook body returns 200 (no retry)
    When I POST "/api/webhooks/razorpay" with webhook signature "valid" and body:
      """
      {not valid json!!!}
      """
    Then the response status is 200

  Scenario: Unknown webhook event is ignored
    When I POST "/api/webhooks/razorpay" with webhook signature "valid" and body:
      """
      {"event":"payment.refunded","payload":{"payment":{"entity":{"id":"pay_x","order_id":"ord_x"}}}}
      """
    Then the response status is 200

  Scenario: Verify payment with non-existent Razorpay order fails
    Given I am logged in as "verify@test.com" with password "Secret@123"
    When I POST "/api/checkout/verify-payment" with auth and body:
      """
      {"razorpayOrderId":"order_fake","razorpayPaymentId":"pay_fake","razorpaySignature":"bad"}
      """
    Then the response status is 400
