package com.pochampally.service;

import com.pochampally.entity.*;
import com.pochampally.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;

    private static final long FREE_SHIPPING_THRESHOLD = 99900L; // Rs 999 in paisa
    private static final long SHIPPING_COST = 9900L; // Rs 99 in paisa

    @Transactional
    public Order createOrderFromItems(List<Map<String, Object>> items, String customerName,
                                      String customerPhone, String customerEmail, Map<String, String> shippingAddress) {
        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("No items provided");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .shippingAddress(shippingAddress)
                .status(Order.OrderStatus.PLACED)
                .createdTime(Instant.now())
                .build();

        long subtotal = 0;
        long gstAmount = 0;

        for (Map<String, Object> item : items) {
            String productId = (String) item.get("productId");
            if (productId == null) productId = (String) item.get("sareeId");
            if (productId == null) {
                throw new IllegalArgumentException("Item missing productId");
            }
            int qty = item.get("quantity") instanceof Number ? ((Number) item.get("quantity")).intValue() : 1;
            if (qty <= 0) {
                throw new IllegalArgumentException("Item quantity must be positive");
            }

            Product product = productService.getById(productId);
            if (product.getStock() < qty) {
                throw new IllegalStateException("Insufficient stock for " + product.getName());
            }

            long itemTotal = product.getSellingPrice() * qty;
            subtotal += itemTotal;
            gstAmount += (itemTotal * product.getGstPct()) / 100;

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(qty)
                    .unitPrice(product.getSellingPrice())
                    .totalPrice(itemTotal)
                    .build();
            orderItem.setOrder(order);
            order.getItems().add(orderItem);

            productService.decrementStock(product.getId(), qty);
        }
        long shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        long totalAmount = subtotal + gstAmount + shippingCost;

        order.setSubtotal(subtotal);
        order.setGstAmount(gstAmount);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    @Transactional
    public Order createOrder(String sessionId, String customerName, String customerPhone,
                             String customerEmail, Map<String, String> shippingAddress) {
        List<CartItem> cartItems = cartService.getCart(sessionId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .shippingAddress(shippingAddress)
                .status(Order.OrderStatus.PLACED)
                .createdTime(Instant.now())
                .build();

        long subtotal = 0;
        long gstAmount = 0;

        for (CartItem cartItem : cartItems) {
            Product product = productService.getById(cartItem.getProductId());

            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for " + product.getName());
            }

            long itemTotal = product.getSellingPrice() * cartItem.getQuantity();
            subtotal += itemTotal;
            gstAmount += (itemTotal * product.getGstPct()) / 100;

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .totalPrice(itemTotal)
                    .build();

            order.addItem(orderItem);
        }
        long shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        long totalAmount = subtotal + gstAmount + shippingCost;

        order.setSubtotal(subtotal);
        order.setGstAmount(gstAmount);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Decrement stock for all items
        for (CartItem cartItem : cartItems) {
            productService.decrementStock(cartItem.getProductId(), cartItem.getQuantity());
        }

        // Clear the cart after order creation
        cartService.clearCart(sessionId);

        return savedOrder;
    }

    public Order getByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderNumber));
    }

    public Order getByRazorpayOrderId(String razorpayOrderId) {
        return orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found for Razorpay order: " + razorpayOrderId));
    }

    public List<Order> listAll() {
        return orderRepository.findAll();
    }

    public List<Order> listByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> listByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    @Transactional
    public Order updateStatus(String id, Order.OrderStatus newStatus, String trackingNumber) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));

        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);

        if (trackingNumber != null && !trackingNumber.isBlank()) {
            order.setTrackingNumber(trackingNumber);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order markAsPaid(String razorpayOrderId, String razorpayPaymentId) {
        Order order = getByRazorpayOrderId(razorpayOrderId);
        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setPaymentStatus("captured");
        order.setStatus(Order.OrderStatus.PAID);
        return orderRepository.save(order);
    }

    @Transactional
    public Order markPaymentFailed(String razorpayOrderId) {
        Order order = getByRazorpayOrderId(razorpayOrderId);
        order.setPaymentStatus("failed");
        return orderRepository.save(order);
    }

    @Transactional
    public Order setRazorpayOrderId(String orderId, String razorpayOrderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setRazorpayOrderId(razorpayOrderId);
        return orderRepository.save(order);
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus target) {
        boolean valid = switch (current) {
            case PLACED -> target == Order.OrderStatus.PAID || target == Order.OrderStatus.CANCELLED;
            case PAID -> target == Order.OrderStatus.SHIPPED || target == Order.OrderStatus.CANCELLED;
            case SHIPPED -> target == Order.OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!valid) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + target);
        }
    }

    private String generateOrderNumber() {
        long timestamp = Instant.now().toEpochMilli();
        String random6 = randomAlphanumeric(6);
        return "DHN-" + timestamp + "-" + random6;
    }

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private String randomAlphanumeric(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC.charAt(ThreadLocalRandom.current().nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }
}
