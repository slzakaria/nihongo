// Uploads the phrase and kana JSON files to Supabase.
// Run from the project root with: node --env-file=.env scripts/seed-content.mjs
// Uses the service role key, so keep it on the server and never expose it to the browser.
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Phrase responses live in their own file, so attach them to each phrase before upload
const responses = JSON.parse(
  await readFile('src/lib/data/phrase-responses.json', 'utf8'),
);

const datasets = [
  { table: 'phrase_scenarios', file: 'src/lib/data/phrases.json' },
  { table: 'hiragana_rows', file: 'src/lib/data/hiragana.json' },
  { table: 'katakana_rows', file: 'src/lib/data/katakana.json' },
];

for (const { table, file } of datasets) {
  const { scenarios } = JSON.parse(await readFile(file, 'utf8'));
  const rows = scenarios.map((s, index) => ({
    slug: s.slug,
    label: s.label,
    icon: s.icon ?? '',
    sort_order: index,
    phrases:
      table === 'phrase_scenarios'
        ? s.phrases.map((p) => ({ ...p, responses: responses[p.id] ?? [] }))
        : s.phrases,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from(table)
    .upsert(rows, { onConflict: 'slug' });
  if (upsertError) throw new Error(`${table} upsert failed: ${upsertError.message}`);

  // Remove groups that no longer exist in the JSON file
  const slugList = rows.map((r) => `"${r.slug}"`).join(',');
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .not('slug', 'in', `(${slugList})`);
  if (deleteError) throw new Error(`${table} cleanup failed: ${deleteError.message}`);

  console.log(`${table}: ${rows.length} groups uploaded`);
}
