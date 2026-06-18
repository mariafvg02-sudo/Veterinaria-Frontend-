const fs = require('fs');
const path = require('path');

let apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.warn('⚠️ ADVERTENCIA: API_URL no definida. Usando fallback local.');
  apiUrl = 'http://localhost:8080/api';
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

// Generamos en environment.ts para que sea el archivo base usado por todos los servicios
const outputPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`✓ environment.prod.ts generado con apiUrl: ${apiUrl}`);
