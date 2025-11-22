export function formatCompactNumber(
  value: number,
  options?: {
    trimTrailingZeros?: boolean;
  },
): string {
  const { trimTrailingZeros = true } = options ?? {};

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  });

  let formatted = formatter.format(value).toLowerCase();

  if (trimTrailingZeros) {
    formatted = formatted.replace(/\.0+(?=[a-z])/, '');
    formatted = formatted.replace(/(\.\d*[1-9])0+(?=[a-z])/, '$1');
  }

  return formatted;
}
