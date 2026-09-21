/**
 * Format currency in Latin American convention: $ 1.500,00 USDC
 */
export function formatLatamCurrency(amount: number, currency = "USDC"): string {
  const fixed = amount.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${integerPart},${parts[1]} ${currency}`;
}

/**
 * Format a short currency without the currency label
 */
export function formatShortCurrency(amount: number): string {
  const fixed = amount.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${integerPart},${parts[1]}`;
}

/**
 * Calculate fee breakdown
 */
export function calculateFees(grossAmount: number, feePercent = 0.005) {
  const fee = grossAmount * feePercent;
  const net = Math.max(0, grossAmount - fee);
  return { gross: grossAmount, fee, net };
}

/**
 * Estimate local currency equivalents
 */
export function getLocalEstimates(usdcAmount: number) {
  return {
    ars: Math.round(usdcAmount * 1220).toLocaleString("es-AR"),
    cop: Math.round(usdcAmount * 4200).toLocaleString("es-CO"),
    mxn: Math.round(usdcAmount * 20.5).toLocaleString("es-MX"),
  };
}

/**
 * Generate a mock invoice ID
 */
export function generateInvoiceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `INV-2026-${num}`;
}

/**
 * Generate a mock payment link
 */
export function generatePaymentLink(): string {
  const hash = Math.random().toString(36).substring(2, 8);
  return `https://pactopay.lat/pagar/inv_${hash}`;
}

/**
 * Truncate a Stellar address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get today's date in Spanish format
 */
export function getSpanishDate(): string {
  const now = new Date();
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${now.getDate()} de ${months[now.getMonth()]}, ${now.getFullYear()}`;
}
