const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('ERROR: La variable de entorno API_URL no está definida.');
  console.error('Configúrala en el dashboard de Vercel: Settings → Environment Variables');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

const outputPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`✓ environment.prod.ts generado con apiUrl: ${apiUrl}`);
