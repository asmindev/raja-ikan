import type { FormErrors } from '../schema';

/**
 * Extract the first error message from string or array
 */
export const getErrorMessage = (
    error: string | string[] | undefined,
): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return error[0] || '';
};

/**
 * Check if a field has an error
 */
export const hasFieldError = (
    errors: FormErrors,
    fieldName: string,
): boolean => {
    return !!errors[fieldName];
};

/**
 * Parse nested order_lines errors from Laravel
 * Example: "order_lines.0.product_id" -> "Item #1: Product is required"
 */
export const getOrderLinesError = (errors: FormErrors): string => {
    const orderLineErrors: string[] = [];

    Object.keys(errors).forEach((key) => {
        // Match pattern: order_lines.{index}.{field}
        const match = key.match(/^order_lines\.(\d+)\.(\w+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            const field = match[2];
            const errorMessage = getErrorMessage(errors[key]);

            // Field name mapping
            const fieldNames: Record<string, string> = {
                product_id: 'Product',
                quantity: 'Quantity',
                price: 'Price',
            };

            const fieldLabel = fieldNames[field] || field;
            orderLineErrors.push(
                `Item #${index + 1}: ${fieldLabel} ${errorMessage}`,
            );
        }
    });

    return orderLineErrors.join(', ');
};
