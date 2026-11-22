// Copia o wasm do v86 para public/, onde o navegador o busca.
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
fs.mkdirSync(path.join(raiz, 'public/v86'), { recursive: true });
fs.copyFileSync(path.join(raiz, 'node_modules/v86/build/v86.wasm'), path.join(raiz, 'public/v86/v86.wasm'));
