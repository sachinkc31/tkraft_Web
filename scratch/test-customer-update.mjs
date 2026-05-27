import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const wooUrl = env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const key = env.WOOCOMMERCE_CONSUMER_KEY;
const secret = env.WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function test() {
  console.log('Testing WooCommerce customer fetch...');
  // Fetch a customer first
  const fetchUrl = `${wooUrl}/customers?per_page=1`;
  const fetchRes = await fetch(fetchUrl, {
    headers: {
      Authorization: `Basic ${auth}`,
    }
  });

  if (!fetchRes.ok) {
    console.error('Fetch failed:', await fetchRes.text());
    return;
  }

  const customers = await fetchRes.json();
  if (customers.length === 0) {
    console.error('No customers found to test with.');
    return;
  }

  const customer = customers[0];
  console.log(`Testing update on customer ID: ${customer.id} (${customer.email})`);

  const updateUrl = `${wooUrl}/customers/${customer.id}`;
  const updateRes = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meta_data: [
        {
          key: 'saved_addresses',
          value: JSON.stringify([{ id: 'test', first_name: 'Test' }])
        }
      ]
    })
  });

  console.log('Update Status:', updateRes.status);
  const responseText = await updateRes.text();
  console.log('Update Response:', responseText);
}

test().catch(console.error);
