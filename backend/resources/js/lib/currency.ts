/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 50.000")
 */
export function formatRupiah(amount: number | string): string {
    const numericAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount);
}

/**
 * Format number to Indonesian number format without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "50.000")
 */
export function formatNumber(amount: number | string): string {
    const numericAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
        return '0';
    }

    return new Intl.NumberFormat('id-ID').format(numericAmount);
}
