/** Format wallet amount for sidebar / panel display. */
/** Compact currency label for the sidebar trigger. */
export function formatWalletAmount(balance, currency) {
    const amount = balance.trim();
    const code = currency.trim().toUpperCase();
    if (amount.length === 0)
        return '—';
    if (code === 'USD')
        return `$${amount}`;
    if (code.length === 0)
        return amount;
    return `${amount} ${code}`;
}
//# sourceMappingURL=format.js.map