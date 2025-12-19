// Helper to get error message from Inertia errors
export const getErrorMessage = (
    error: string | string[] | undefined,
): string | undefined => {
    if (!error) return undefined;
    return Array.isArray(error) ? error[0] : error;
};

// Helper to check if there are any errors for a specific field
export const hasFieldError = (
    errors: Record<string, any>,
    fieldName: string,
): boolean => {
    return Object.keys(errors).some((key) => key.startsWith(fieldName));
};

// Helper to get the first error message for order_lines
export const getOrderLinesError = (
    errors: Record<string, any>,
): string | undefined => {
    const orderLineKeys = Object.keys(errors).filter((key) =>
        key.startsWith('order_lines.'),
    );

    if (orderLineKeys.length > 0) {
        const firstKey = orderLineKeys[0];
        const error = errors[firstKey];
        const message = getErrorMessage(error);

        // Parse the key to get line number and field
        const match = firstKey.match(/order_lines\.(\d+)\.(\w+)/);
        if (match) {
            const lineNumber = parseInt(match[1]) + 1; // Convert to 1-based
            const fieldName = match[2];
            const fieldLabel =
                fieldName === 'product_id'
                    ? 'Product'
                    : fieldName === 'quantity'
                      ? 'Quantity'
                      : 'Price';
            return `Item #${lineNumber}: ${fieldLabel} is required`;
        }

        return message || 'Please fix the order items';
    }

    return undefined;
};
