/**
 * Utility to format numbers into Indian Rupee (INR / ₹) standard currency format
 * Example: 119900 -> ₹1,19,900
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.round(Number(val));
  return '₹' + num.toLocaleString('en-IN');
}
