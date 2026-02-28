/**
 * Currency and Number Formatting Utilities
 * Standardizes the display of monetary values and counts across the app.
 */

/**
 * Formats a number as Indian Rupee (₹)
 * @param {number|string} amount - The value to format
 * @param {boolean} compact - If true, formats as 1.2k, 1.5L, etc.
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, compact = false) => {
    const value = parseFloat(amount) || 0;

    if (compact) {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    }

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    } catch (error) {
        // Fallback for Hermes/engines that don't support en-IN or currency styling fully
        return `₹${value.toLocaleString()}`;
    }
};

/**
 * Formats a number with comma separators based on en-IN locale
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
    const value = parseFloat(num) || 0;
    try {
        return new Intl.NumberFormat('en-IN').format(value);
    } catch (error) {
        // Fallback for missing en-IN locale
        return value.toLocaleString();
    }
};

/**
 * Formats a decimal/percentage
 * @param {number} value - The value to format
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value) => {
    return `${Math.round(value)}%`;
};
/**
 * Formats a date string into a localized format (en-IN)
 * @param {string|Date} date - The date to format
 * @param {boolean} includeYear - Whether to include the year
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeYear = true) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const options = { day: '2-digit', month: 'short' };
    if (includeYear) options.year = 'numeric';
    try {
        return d.toLocaleDateString('en-IN', options);
    } catch (err) {
        return d.toLocaleDateString(undefined, options);
    }
};
