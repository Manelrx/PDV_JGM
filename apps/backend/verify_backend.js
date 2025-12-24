const { Client } = require('pg');
const http = require('http');
const crypto = require('crypto');

// Configuration
const DB_CONFIG = {
    connectionString: 'postgresql://admin:password@localhost:5432/pdv_jgm',
};
const JWT_SECRET = 'dev_secret_key_123';
const USER_ID = 'test-user-001';
const PRODUCT_CODE = 'PROD-TEST-001';
const STORE_ID = 'STORE-TEST-001';

// Generate JWT
function generateToken() {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: USER_ID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };

    const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const signatureInput = `${encode(header)}.${encode(payload)}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');

    return `${signatureInput}.${signature}`;
}

async function runQuery(query, params = []) {
    const client = new Client(DB_CONFIG);
    try {
        await client.connect();
        const res = await client.query(query, params);
        await client.end();
        return res;
    } catch (e) {
        console.error('DB Error:', e);
        await client.end();
        process.exit(1);
    }
}

async function request(method, path, body = null, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log('--- BACKEND VERIFICATION START ---');
    const token = generateToken();
    console.log('1. Generated JWT for User:', USER_ID);

    // 2. Setup Data
    console.log('2. Seeding Database...');
    try {
        // Insert Product
        await runQuery(`
            INSERT INTO products (code, name, uom, "isActive", "createdAt", "updatedAt") 
            VALUES ($1, 'Test Product', 'UN', true, NOW(), NOW()) 
            ON CONFLICT (code) DO NOTHING
        `, [PRODUCT_CODE]);

        // Insert Price
        // Need to handle relation. Assuming 'productCode' column or similar.
        // Let's check schema first by simple query or just try typical TypeORM naming: 'productCode'
        // Actually, let's just inspect the column names of 'prices' first to be safe.
        const cols = await runQuery(`SELECT column_name FROM information_schema.columns WHERE table_name = 'prices'`);
        const columns = cols.rows.map(r => r.column_name);
        console.log('Prices columns:', columns);

        const prodCol = columns.includes('productCode') ? 'productCode' : 'productId';

        await runQuery(`
            INSERT INTO prices (id, "${prodCol}", "priceList", price, currency, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, 'Standard', 10.50, 'BRL', NOW(), NOW())
            ON CONFLICT DO NOTHING -- Unique index might trigger
        `, [PRODUCT_CODE]);

    } catch (e) {
        // If conflict on price unique index, it's fine.
        console.log('Seeding note:', e.message);
    }

    // 3. Happy Path
    console.log('\n3. Execution Flow');

    // Start Session
    console.log('-> Start Session');
    const startRes = await request('POST', '/session/start', { storeId: STORE_ID }, token);
    console.log('Start Status:', startRes.status, 'ID:', startRes.body.id);
    const sessionId = startRes.body.id;

    if (!sessionId) throw new Error('Failed to start session');

    // Add Item
    console.log('-> Add Item');
    const addRes = await request('PATCH', `/session/${sessionId}/cart`, { productCode: PRODUCT_CODE, quantity: 2 }, token);
    console.log('Add Item Status:', addRes.status, 'Total:', addRes.body.total);

    // Close Session
    console.log('-> Close Session');
    const closeRes = await request('POST', `/session/${sessionId}/close`, {}, token);
    console.log('Close Status:', closeRes.status, 'Status:', closeRes.body.status);

    // Create Sale
    console.log('-> Create Sale');
    const saleRes = await request('POST', `/sales/from-session/${sessionId}`, {}, token);
    console.log('Sale Status:', saleRes.status, 'SaleID:', saleRes.body.id);

    if (saleRes.status === 201) {
        console.log('\nSUCCESS: Full flow completed!');
    } else {
        console.error('\nFAILED: Flow interrupted.');
        process.exit(1);
    }
}

main().catch(console.error);
