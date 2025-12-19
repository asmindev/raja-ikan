# Order Domain Layer

## Struktur

```
domain/order/
├── entities/
│   ├── Order.ts           # Order aggregate root
│   └── OrderItem.ts       # Order item value object
├── repositories/
│   └── IOrderRepository.ts # Repository interface
├── services/
│   └── OrderService.ts    # Domain business logic
├── types.ts               # Domain types
└── index.ts              # Exports
```

## Usage Example

### 1. Setup Dependencies (DI)

```typescript
import { OrderRepository } from "@/infrastructure/database";
import { OrderService } from "@/domain/order";

// Create repository instance
const orderRepository = new OrderRepository();

// Create service with injected repository
const orderService = new OrderService(orderRepository);
```

### 2. Extract Order from Text

```typescript
const items = orderService.extractOrderItems("pesan lele 5kg sama nila 3kg");
// Result: [
//   { name: "lele", qty: 5, unit: "kg" },
//   { name: "nila", qty: 3, unit: "kg" }
// ]
```

### 3. Create Pending Order

```typescript
const order = await orderService.createPendingOrder("628123456789", items);

console.log(order.getItemsSummary());
// Output:
// 1. lele 5 kg
// 2. nila 3 kg
```

### 4. Confirm Order

```typescript
const confirmed = await orderService.confirmOrder("628123456789");
console.log(confirmed.status); // "confirmed"
console.log(confirmed.isConfirmed()); // true
```

### 5. Cancel Order

```typescript
await orderService.cancelOrder("628123456789");
```

### 6. Get Orders

```typescript
// Get pending order
const pending = await orderService.getPendingOrder("628123456789");

// Get all customer orders
const customerOrders = await orderService.getCustomerOrders("628123456789");

// Get orders by status
const confirmedOrders = await orderService.getOrdersByStatus("confirmed");
```

## Benefits

✅ **Testable**: Mock repository for unit tests
✅ **Type-safe**: Full TypeScript support
✅ **Validation**: Built-in entity validation
✅ **Business logic**: Centralized in domain layer
✅ **Database agnostic**: Repository pattern abstraction

## Example: Integration with Message Handler

```typescript
import { orderService } from "@/container"; // DI container
import { sendOrderConfirmation } from "@/whatsapp/helpers";

// In message handler
const items = orderService.extractOrderItems(text);

if (items.length > 0) {
    const order = await orderService.createPendingOrder(from, items);
    const summary = orderService.getOrderSummaryText(order);

    await sendOrderConfirmation(sock, from, summary);
}
```

## Next Steps

-   [ ] Integrate with message handlers
-   [ ] Add price fetching from backend
-   [ ] Add order notifications
-   [ ] Add order history API endpoints
