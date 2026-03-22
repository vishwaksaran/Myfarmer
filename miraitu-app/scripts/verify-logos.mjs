import { readdirSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const dir = join(import.meta.dirname, '..', 'public', 'images', 'brands', 'tractors');
const files = readdirSync(dir).filter(f => f.endsWith('.png'));

console.log('Total PNG files:', files.length);

const hashMap = new Map();
for (const f of files) {
  const buf = readFileSync(join(dir, f));
  const hash = createHash('md5').update(buf).digest('hex');
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  console.log(`  ${f.padEnd(25)} ${buf.length}B  PNG:${isPng}  hash:${hash.slice(0, 8)}`);
  const arr = hashMap.get(hash) || [];
  arr.push(f);
  hashMap.set(hash, arr);
}

console.log('\nUnique hashes:', hashMap.size);
for (const [hash, fileList] of hashMap.entries()) {
  if (fileList.length > 1) {
    console.log(`  DUPLICATE (${hash.slice(0, 8)}): ${fileList.length} files - ${fileList.join(', ')}`);
  }
}
