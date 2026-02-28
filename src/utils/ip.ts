import ipaddr from 'ipaddr.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an IP address string (IPv4 or IPv6).
 * Returns validation result with user-friendly error message if invalid.
 */
export function validateIp(input: string): ValidationResult {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { valid: false, error: 'IP address is required' };
  }

  try {
    ipaddr.parse(trimmed);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid IPv4 or IPv6 address' };
  }
}
