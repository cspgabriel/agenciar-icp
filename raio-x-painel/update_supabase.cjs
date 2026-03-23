const { Client } = require('pg');

const connectionString = 'postgresql://postgres:@FlamengoxD1212@db.ejrbbptxrntidnpmnicb.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase');

    const query = `
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS raiox_data JSONB,
      ADD COLUMN IF NOT EXISTS icp_data JSONB;
    `;

    await client.query(query);
    console.log('✅ Colunas icp_data e raiox_data criadas com sucesso!');

  } catch (err) {
    console.error('❌ Erro:', err.stack);
  } finally {
    await client.end();
  }
}

run();
