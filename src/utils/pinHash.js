/**
 * PIN hashing utilities using Web Crypto API with PBKDF2
 * Uses per-user random salt and slow key derivation for brute-force protection
 */

// Generate a hash of the PIN using PBKDF2 with random salt
export async function hashPin(pin, existingSaltHex = null) {
  let salt;
  let saltHex;
  
  if (existingSaltHex) {
    // Use existing salt (for verification)
    saltHex = existingSaltHex;
    salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  } else {
    // Generate new random salt
    salt = crypto.getRandomValues(new Uint8Array(16));
    saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  const encoder = new TextEncoder();
  
  // Import PIN as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2 with 100,000 iterations (slows brute force)
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return combined format: salt$hash
  return `${saltHex}$${hashHex}`;
}

// Verify a PIN against a stored hash
export async function verifyPin(pin, storedHash) {
  // Handle legacy format (no salt separator)
  if (!storedHash.includes('$')) {
    // Legacy SHA-256 with static salt - verify and return true for migration
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + '_sagar_portal_salt_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return legacyHash === storedHash;
  }
  
  // New format: salt$hash
  const [saltHex] = storedHash.split('$');
  const newHash = await hashPin(pin, saltHex);
  return newHash === storedHash;
}
