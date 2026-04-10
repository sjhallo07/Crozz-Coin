export function shortAddress(value: string, size = 6)
{
    if (!value) return '—';
    if (value.length <= size * 2) return value;
    return `${value.slice(0, size)}…${value.slice(-size)}`;
}

export function toBaseUnits(value: string, decimals: number): string
{
    const normalized = value.trim();
    if (!normalized) throw new Error('Enter an amount.');
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error('Amount must be a positive number.');
    }

    const [whole, fraction = ''] = normalized.split('.');
    if (fraction.length > decimals) {
        throw new Error(`Amount supports up to ${decimals} decimal places.`);
    }

    const paddedFraction = fraction.padEnd(decimals, '0');
    const joined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
    return joined || '0';
}

export function formatTokenAmount(value: string | number | bigint, decimals: number): string
{
    const raw = BigInt(value);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;

    if (fraction === BigInt(0)) return whole.toString();

    return `${whole}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '')}`;
}
