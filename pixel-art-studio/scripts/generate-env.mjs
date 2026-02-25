import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  const missing = [
    !supabaseUrl ? 'SUPABASE_URL' : null,
    !supabasePublishableKey ? 'SUPABASE_PUBLISHABLE_KEY' : null,
  ]
    .filter(Boolean)
    .join(', ');

  throw new Error(
    `[generate-env] Missing required env vars: ${missing}. ` +
      'Set them in Vercel Project Settings -> Environment Variables.',
  );
}

const environmentFile = `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabasePublishableKey: '${supabasePublishableKey}',
};
`;

const outputPath = resolve(process.cwd(), 'src/environments/environment.ts');
writeFileSync(outputPath, environmentFile, { encoding: 'utf8' });

console.log('[generate-env] src/environments/environment.ts generated for production build.');
