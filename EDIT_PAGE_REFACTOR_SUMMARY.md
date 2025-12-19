# Edit Order Page - Modular Refactoring Summary

## Overview

Refactored the edit order page from **547 lines** of monolithic code to **73 lines** using a modular architecture, matching the structure of the create page.

## Changes Made

### 1. Backend Updates (Already Done)

-   ✅ Added validation in `edit()` and `update()` methods
-   ✅ Restrict editing to confirmed orders (`confirmed_at` must exist)
-   ✅ Restrict editing to pending status only (`status === 'pending'`)
-   ✅ Added latitude, longitude, notes fields to validation
-   ✅ Removed status field from update (stays 'pending')

### 2. Frontend Modular Structure

#### File Structure

```
edit/
├── index.tsx (73 lines - main page)
├── schema.ts (types + FormErrors)
├── components/
│   ├── customer-selector.tsx (Combobox)
│   ├── driver-selector.tsx (Combobox)
│   ├── delivery-address-section.tsx (address, lat, lng, notes)
│   ├── order-items-list.tsx (dynamic product list)
│   ├── order-summary.tsx (total display)
│   ├── form-actions.tsx (cancel/submit buttons)
│   └── order-form.tsx (orchestrator)
├── hooks/
│   └── use-edit-order-form.ts (state management)
└── utils/
    ├── format-options.ts (combobox data formatting)
    ├── order-calculations.ts (calculateOrderTotal, validateOrderLines)
    └── error-helper.ts (nested error parsing)
```

#### Key Features

**1. Modular Components**

-   `CustomerSelector`: Combobox with auto-fill address/lat/lng
-   `DriverSelector`: Optional driver assignment with Combobox
-   `DeliveryAddressSection`: Address, latitude, longitude, notes fields
-   `OrderItemsList`: Dynamic product list with add/remove
-   `OrderSummary`: Total calculation display
-   `FormActions`: Cancel and submit buttons
-   `OrderForm`: Main orchestrator component

**2. Custom Hook: `useEditOrderForm`**

-   Manages form state using Inertia's `useForm`
-   Auto-fills customer data (address, lat, lng)
-   Auto-fills product price on selection
-   Client-side validation for order lines
-   Handles form submission

**3. Error Handling**

-   Reuses error helper utilities from create page
-   Parses nested Laravel validation errors: `order_lines.0.product_id`
-   Displays user-friendly error messages: "Item #1: Product is required"
-   Supports both string and array error formats

**4. Removed Features**

-   ❌ React Hook Form (switched to Inertia useForm)
-   ❌ Zod validation (using backend validation)
-   ❌ Status field dropdown (status stays 'pending')

**5. Added Features**

-   ✅ Latitude field (auto-filled from customer)
-   ✅ Longitude field (auto-filled from customer)
-   ✅ Notes field (optional)
-   ✅ Combobox for all dropdowns (consistent with create/show pages)

## Backend Validation Messages

When editing is not allowed, users will see these error messages:

1. **Order not confirmed:**

    > "Order belum dikonfirmasi. Konfirmasi order terlebih dahulu sebelum mengedit."

2. **Order not in pending status:**
    > "Order hanya bisa diedit jika masih dalam status pending."

## Benefits

1. **Maintainability**: Reduced from 547 to 73 lines in main file
2. **Reusability**: Components can be reused across pages
3. **Consistency**: Matches create page structure exactly
4. **Testability**: Each component/util is isolated and testable
5. **Error Handling**: Robust nested error parsing
6. **UX**: Better feedback with Combobox and auto-fill

## File Comparison

| Aspect          | Before                | After                   |
| --------------- | --------------------- | ----------------------- |
| Main file lines | 547                   | 73                      |
| Architecture    | Monolithic            | Modular                 |
| Form library    | React Hook Form + Zod | Inertia useForm         |
| Validation      | Client (Zod)          | Server (Laravel)        |
| Error handling  | Basic                 | Nested error support    |
| Components      | 1 file                | 7 component files       |
| Utilities       | Inline                | 3 utility files         |
| Hooks           | None                  | 1 custom hook           |
| Dropdowns       | Select + Combobox mix | Combobox only           |
| Location fields | None                  | Latitude + Longitude    |
| Notes field     | None                  | Added                   |
| Status field    | Editable dropdown     | Removed (stays pending) |

## Next Steps

1. **Test the edit workflow:**

    - Try editing unconfirmed order → should redirect with error
    - Try editing accepted/completed order → should redirect with error
    - Try editing confirmed pending order → should work
    - Verify latitude/longitude auto-fill from customer
    - Verify notes field saves correctly

2. **Flash message display:**

    - Ensure Laravel flash messages show in layout
    - Test error messages display correctly

3. **Edge cases to test:**
    - Empty order lines
    - Invalid product selection
    - Invalid quantity
    - Missing required fields
    - Nested validation errors

## Integration Points

The edit page now integrates seamlessly with:

-   **OrderController@edit**: Validates confirmed_at and status
-   **OrderController@update**: Saves lat/lng/notes, prevents status change
-   **Error handling**: Parses nested Laravel validation errors
-   **Create page**: Shares same utilities and components structure
-   **Show page**: Consistent Combobox pattern for driver assignment

---

**Status**: ✅ Complete - Edit page refactored successfully
**Lines reduced**: 547 → 73 (86.6% reduction)
**Architecture**: Modular, reusable, maintainable
