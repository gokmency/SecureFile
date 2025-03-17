export interface EncryptionResult {
  ciphertext: ArrayBuffer;
  iv: ArrayBuffer;
  salt: ArrayBuffer;
}

export interface DecryptionResult {
  plaintext: ArrayBuffer;
  filename: string;
}

export interface EncryptionMetadata {
  iv: Uint8Array;
  salt: Uint8Array;
  originalName: string;
  originalType: string;
  timestamp: number;
}

export interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'processing' | 'encrypted' | 'decrypted' | 'error';
  result?: EncryptionResult | DecryptionResult;
  error?: string;
  originalName?: string;
  originalType?: string;
  mode?: 'encrypt' | 'decrypt';
}

export interface OperationLog {
  id: string;
  timestamp: Date;
  action: string;
  fileName: string;
  fileSize: number;
  success: boolean;
  error?: string;
}

// Supported file formats information
export const SUPPORTED_FILE_FORMATS = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],
  others: ['json', 'xml', 'html', 'css', 'js', 'csv', 'md']
};

export const ALL_SUPPORTED_FORMATS = Object.values(SUPPORTED_FILE_FORMATS).flat();

// For entropy calculation to measure password strength
export function calculateEntropy(password: string): number {
  if (!password) return 0;
  
  let charset = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  
  if (hasLowercase) charset += 26;
  if (hasUppercase) charset += 26;
  if (hasNumbers) charset += 10;
  if (hasSymbols) charset += 33; // Approximate
  
  // Shannon entropy formula: L * log2(N)
  // L = password length, N = character set size
  return password.length * Math.log2(charset || 1);
}

// Convert an array buffer to a Base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert a Base64 string to an array buffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a key from a password using PBKDF2
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> {
  // Convert password to a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive an AES-GCM key using PBKDF2
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate a random salt
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Generate a random initialization vector
export function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// Encrypt a file using AES-GCM
export async function encryptFile(
  file: File,
  password: string,
  onProgress?: (progress: number) => void
): Promise<EncryptionResult> {
  // Generate salt and IV
  const salt = generateSalt();
  const iv = generateIV();
  
  // Derive key from password
  const key = await deriveKey(password, salt);

  // Read the file
  const fileData = await readFileAsArrayBuffer(file, onProgress);
  
  // Create metadata
  const metadata: EncryptionMetadata = {
    iv,
    salt,
    originalName: file.name,
    originalType: file.type,
    timestamp: Date.now()
  };
  
  // Convert metadata to JSON
  const metadataString = JSON.stringify({
    iv: Array.from(metadata.iv),
    salt: Array.from(metadata.salt),
    originalName: metadata.originalName,
    originalType: metadata.originalType,
    timestamp: metadata.timestamp
  });
  
  // Encode metadata
  const metadataBytes = new TextEncoder().encode(metadataString);
  
  // Create a header with 4 bytes for the metadata length
  const metadataLength = new Uint32Array([metadataBytes.length]);
  const headerBytes = new Uint8Array(metadataLength.buffer);
  
  // Combine the header, metadata, and file data
  const data = new Uint8Array(
    headerBytes.length + metadataBytes.length + fileData.byteLength
  );
  data.set(headerBytes, 0);
  data.set(metadataBytes, headerBytes.length);
  data.set(new Uint8Array(fileData), headerBytes.length + metadataBytes.length);
  
  // Encrypt the data
  try {
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return { ciphertext, iv: iv.buffer, salt: salt.buffer };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

// Decrypt a file using AES-GCM
export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string,
  onProgress?: (progress: number) => void
): Promise<DecryptionResult> {
  try {
    // İlk 16 bytes salt ve sonraki 12 bytes IV değerini içerir
    const encryptedDataBytes = new Uint8Array(encryptedData);
    
    // Salt ve IV değerlerini dosyanın başından çıkarıyoruz
    const salt = encryptedDataBytes.slice(0, 16);
    const iv = encryptedDataBytes.slice(16, 28);
    
    // Geriye kalan kısım şifrelenmiş veridir
    const ciphertext = encryptedDataBytes.slice(28);
    
    // Şifreden anahtar türetme
    const key = await deriveKey(password, salt);
    
    try {
      // Şifrelenmiş veriyi çözme
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      
      // İlk 4 byte meta veri uzunluğunu içerir
      const metadataLengthBytes = new Uint8Array(decrypted, 0, 4);
      const metadataLength = new Uint32Array(metadataLengthBytes.buffer)[0];
      
      // Sonraki byte'lar meta veriyi içerir
      const metadataBytes = new Uint8Array(decrypted, 4, metadataLength);
      const metadataString = new TextDecoder().decode(metadataBytes);
      const metadata = JSON.parse(metadataString) as {
        originalName: string;
        originalType: string;
      };
      
      // Geri kalan kısım dosya verisidir
      const fileData = decrypted.slice(4 + metadataLength);
      
      return {
        plaintext: fileData,
        filename: metadata.originalName
      };
    } catch (decryptError) {
      console.error('Decryption operation failed:', decryptError);
      throw new Error('Decryption failed. Please make sure you entered the correct password or the file might be corrupted.');
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// Read a file as an ArrayBuffer with progress updates
export function readFileAsArrayBuffer(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return an ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Create a download link for an encrypted file
export function createDownloadLink(
  data: ArrayBuffer,
  salt: ArrayBuffer,
  iv: ArrayBuffer,
  originalFilename: string
): { url: string; filename: string } {
  // Combine salt, IV, and ciphertext
  const combinedData = new Uint8Array(
    salt.byteLength + iv.byteLength + data.byteLength
  );
  combinedData.set(new Uint8Array(salt), 0);
  combinedData.set(new Uint8Array(iv), salt.byteLength);
  combinedData.set(new Uint8Array(data), salt.byteLength + iv.byteLength);
  
  // Create a Blob from the combined data
  const blob = new Blob([combinedData], { type: 'application/octet-stream' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a filename
  const extension = '.enc';
  const filename = `${originalFilename}${extension}`;
  
  return { url, filename };
}

// Create a download link for a decrypted file
export function createDecryptedFileDownload(
  data: ArrayBuffer,
  filename: string,
  type: string = 'application/octet-stream'
): { url: string; filename: string } {
  // Create a Blob from the data
  const blob = new Blob([data], { type });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  return { url, filename };
}
