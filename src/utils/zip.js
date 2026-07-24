/**
 * Zero-dependency pure Node.js PKZIP file archive generator.
 */
'use strict';

const zlib = require('zlib');

// Precompute CRC32 Table for Node 14+ compatibility
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

/**
 * Calculates CRC-32 checksum of a Buffer.
 * @param {Buffer} buf
 * @returns {number}
 */
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Encodes JavaScript Date to DOS Date/Time bitfield.
 * @param {Date} [d]
 * @returns {{time: number, date: number}}
 */
function toDosDateTime(d = new Date()) {
  const year = Math.max(0, d.getFullYear() - 1980);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = Math.floor(d.getSeconds() / 2);

  return {
    time: (hours << 11) | (minutes << 5) | seconds,
    date: (year << 9) | (month << 5) | day,
  };
}

/**
 * Generates a ZIP archive Buffer from an array or map of files.
 *
 * @param {Array<{path: string, content: string|Buffer}>|Object<string, string|Buffer>} files
 * @returns {Buffer} ZIP Archive Buffer
 */
function createZip(files) {
  const entries = [];
  let fileList = [];

  if (Array.isArray(files)) {
    fileList = files;
  } else if (files && typeof files === 'object') {
    fileList = Object.keys(files).map(filePath => ({
      path: filePath,
      content: files[filePath],
    }));
  }

  const dosDT = toDosDateTime();
  const localHeaders = [];
  const centralDirectoryHeaders = [];
  let currentOffset = 0;

  for (const item of fileList) {
    const fileName = item.path.replace(/\\/g, '/');
    const fileNameBuf = Buffer.from(fileName, 'utf8');

    const uncompressedData = Buffer.isBuffer(item.content)
      ? item.content
      : Buffer.from(String(item.content), 'utf8');

    const checksum = crc32(uncompressedData);
    const uncompressedSize = uncompressedData.length;

    let method = 8; // Deflate
    let compressedData;
    try {
      compressedData = zlib.deflateRawSync(uncompressedData);
    } catch (_) {
      method = 0; // Store fallback
      compressedData = uncompressedData;
    }

    // If compression made it larger (very small text), fallback to Store
    if (compressedData.length >= uncompressedSize) {
      method = 0;
      compressedData = uncompressedData;
    }

    const compressedSize = compressedData.length;

    // ─── Local File Header (30 bytes + filename) ───
    const localHeader = Buffer.alloc(30 + fileNameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);         // Version needed to extract (2.0)
    localHeader.writeUInt16LE(0, 6);          // General purpose bit flag
    localHeader.writeUInt16LE(method, 8);     // Compression method (0 or 8)
    localHeader.writeUInt16LE(dosDT.time, 10);
    localHeader.writeUInt16LE(dosDT.date, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(fileNameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // Extra field length
    fileNameBuf.copy(localHeader, 30);

    // ─── Central Directory Header (46 bytes + filename) ───
    const cdHeader = Buffer.alloc(46 + fileNameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);   // Central directory signature
    cdHeader.writeUInt16LE(20, 4);           // Version made by
    cdHeader.writeUInt16LE(20, 6);           // Version needed to extract
    cdHeader.writeUInt16LE(0, 8);            // General purpose bit flag
    cdHeader.writeUInt16LE(method, 10);      // Compression method
    cdHeader.writeUInt16LE(dosDT.time, 12);
    cdHeader.writeUInt16LE(dosDT.date, 14);
    cdHeader.writeUInt32LE(checksum, 16);
    cdHeader.writeUInt32LE(compressedSize, 20);
    cdHeader.writeUInt32LE(uncompressedSize, 24);
    cdHeader.writeUInt16LE(fileNameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30);           // Extra field length
    cdHeader.writeUInt16LE(0, 32);           // File comment length
    cdHeader.writeUInt16LE(0, 34);           // Disk number start
    cdHeader.writeUInt16LE(0, 36);           // Internal file attributes
    cdHeader.writeUInt32LE(0, 38);           // External file attributes
    cdHeader.writeUInt32LE(currentOffset, 42);// Relative offset of local header
    fileNameBuf.copy(cdHeader, 46);

    localHeaders.push(localHeader, compressedData);
    centralDirectoryHeaders.push(cdHeader);

    currentOffset += localHeader.length + compressedData.length;
  }

  const centralDirectoryOffset = currentOffset;
  const centralDirectorySize = centralDirectoryHeaders.reduce((acc, b) => acc + b.length, 0);

  // ─── End of Central Directory Record (22 bytes) ───
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);                // EOCD signature
  eocd.writeUInt16LE(0, 4);                         // Number of this disk
  eocd.writeUInt16LE(0, 6);                         // Disk where central directory starts
  eocd.writeUInt16LE(fileList.length, 8);           // Number of CD records on this disk
  eocd.writeUInt16LE(fileList.length, 10);          // Total CD records
  eocd.writeUInt32LE(centralDirectorySize, 12);     // Size of central directory
  eocd.writeUInt32LE(centralDirectoryOffset, 16);   // Offset of central directory
  eocd.writeUInt16LE(0, 20);                        // Zip comment length

  return Buffer.concat([...localHeaders, ...centralDirectoryHeaders, eocd]);
}

module.exports = {
  crc32,
  toDosDateTime,
  createZip,
};
