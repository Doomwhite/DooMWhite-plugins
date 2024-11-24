import crypto from 'crypto';
import fs from 'fs';

/**
 * Generates a SHA-512 hash of a file's contents.
 *
 * @param filePath - The path to the file.
 * @returns A Promise that resolves to the SHA-512 hash string.
 */
export async function computeFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha512');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
}