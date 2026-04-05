package com.pochampally.controller;

import com.pochampally.entity.Order;
import com.pochampally.service.OrderService;
import com.pochampally.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final OrderService orderService;
    private final RazorpayService razorpayService;

    /**
     * Step 1: Create order from cart and generate Razorpay order.
     *
     * Request body:
     * {
     *   "sessionId": "abc123",
     *   "customerName": "John Doe",
     *   "customerPhone": "9876543210",
     *   "customerEmail": "john@example.com",
     *   "shippingAddress": {
     *     "line1": "123 Main St",
     *     "line2": "Apt 4",
     *     "city": "Hyderabad",
     *     "state": "Telangana",
     *     "pincode": "500001"
     *   }
     * }
     */
    @PostMapping("/create-order")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> body) {
        String customerName = (String) body.get("customerName");
        String customerPhone = (String) body.get("customerPhone");
        String customerEmail = (String) body.get("customerEmail");
        Map<String, String> shippingAddress = (Map<String, String>) body.get("shippingAddress");
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        String sessionId = (String) body.get("sessionId");

        if (customerName == null || customerPhone == null || shippingAddress == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: customerName, customerPhone, shippingAddress"));
        }

        // Create order — accept items directly from frontend cart
        Order order;
        if (items != null && !items.isEmpty()) {
            order = orderService.createOrderFromItems(items, customerName, customerPhone, customerEmail, shippingAddress);
        } else if (sessionId != null) {
            order = orderService.createOrder(sessionId, customerName, customerPhone, customerEmail, shippingAddress);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Provide items or sessionId"));
        }

        // Create Razorpay order
        String razorpayOrderId = razorpayService.createRazorpayOrder(order.getTotalAmount(), order.getOrderNumber());

        // Save Razorpay order ID back to our order
        orderService.setRazorpayOrderId(order.getId(), razorpayOrderId);

        log.info("Checkout initiated. Order: {}, Razorpay order: {}, Amount: {} paisa",
                order.getOrderNumber(), razorpayOrderId, order.getTotalAmount());

        return ResponseEntity.ok(Map.of(
                "orderId", order.getId(),
                "orderNumber", order.getOrderNumber(),
                "razorpayOrderId", razorpayOrderId,
                "razorpayKeyId", razorpayService.getKeyId(),
                "amount", order.getTotalAmount(),
                "currency", "INR",
                "customerName", customerName,
                "customerEmail", customerEmail != null ? customerEmail : "",
                "customerPhone", customerPhone
        ));
    }

    /**
     * Step 2: Verify payment after Razorpay checkout completes.
     *
     * Request body:
     * {
     *   "razorpayOrderId": "order_xxx",
     *   "razorpayPaymentId": "pay_xxx",
     *   "razorpaySignature": "hmac_signature"
     * }
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> body) {
        String razorpayOrderId = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String razorpaySignature = body.get("razorpaySignature");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields: razorpayOrderId, razorpayPaymentId, razorpaySignature"));
        }

        boolean signatureValid = razorpayService.verifyPaymentSignature(
                razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!signatureValid) {
            log.warn("Payment verification failed for Razorpay order: {}", razorpayOrderId);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Payment verification failed. Invalid signature.",
                    "verified", false));
        }

        Order order = orderService.markAsPaid(razorpayOrderId, razorpayPaymentId);

        log.info("Payment verified. Order: {} marked as PAID. Razorpay payment: {}",
                order.getOrderNumber(), razorpayPaymentId);

        return ResponseEntity.ok(Map.of(
                "verified", true,
                "orderNumber", order.getOrderNumber(),
                "status", order.getStatus().name()));
    }
}
