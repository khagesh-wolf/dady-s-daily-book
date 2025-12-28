/**
 * Simple PIN hashing utilities using Web Crypto API
 * This provides basic protection against casual access to stored PINs
 */

// Generate a hash of the PIN using SHA-256
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_sagar_portal_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify a PIN against a stored hash
export async function verifyPin(pin, storedHash) {
  const pinHash = await hashPin(pin);
  return pinHash === storedHash;
}
