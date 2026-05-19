/**
 * Seed demo shops on a LIVE API (e.g. Render) without direct MongoDB access.
 *
 * Usage:
 *   API_URL=https://local-shop-v93b.onrender.com/api node scripts/seed-catalog-via-api.js
 */
const API_URL = (process.env.API_URL || 'https://local-shop-v93b.onrender.com/api').replace(/\/$/, '');
const OWNER_EMAIL = 'owner@test.com';
const OWNER_PASSWORD = 'password123';

const shops = [
  {
    name: 'Fresh Farm Market',
    description: 'Fresh organic vegetables and fruits from local farms',
    category: 'Farmers Market',
    location: {
      address: '123 Main St',
      city: 'Thunder Bay',
      province: 'ON',
      postalCode: 'P7A 1A1',
    },
    contact: { phone: '+18075550101', email: 'info@freshfarmmarket.com' },
    features: ['Organic', 'Local', 'Pickup'],
  },
  {
    name: 'Artisan Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    category: 'Bakery',
    location: {
      address: '456 Oak Ave',
      city: 'Thunder Bay',
      province: 'ON',
      postalCode: 'P7A2B2',
    },
    contact: { phone: '+18075550102', email: 'hello@artisanbakery.com' },
    features: ['Local', 'Pickup'],
  },
];

const productsByShopIndex = [
  [
    {
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes',
      price: 3.99,
      category: 'Vegetables',
      productType: 'stock',
      inventory: { quantity: 50, unit: 'piece', lowStockThreshold: 10, isUnlimited: false },
    },
  ],
  [
    {
      name: 'Sourdough Bread',
      description: 'Traditional sourdough loaf',
      price: 5.99,
      category: 'Bread',
      productType: 'stock',
      inventory: { quantity: 20, unit: 'piece', lowStockThreshold: 5, isUnlimited: false },
    },
    {
      name: 'Butter Croissant',
      description: 'Flaky butter croissant',
      price: 3.49,
      category: 'Pastry',
      productType: 'stock',
      inventory: { quantity: 30, unit: 'piece', lowStockThreshold: 5, isUnlimited: false },
    },
  ],
];

const request = async (path, options = {}) => {
  const { headers: optionHeaders, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(optionHeaders || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.errors ? JSON.stringify(body.errors) : body.message;
    throw new Error(`${res.status} ${path}: ${detail}`);
  }
  return body;
};

const run = async () => {
  const existing = await request('/shops?limit=50');
  const existingNames = new Set((existing.data || []).map((s) => s.name));

  try {
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testowner',
        email: OWNER_EMAIL,
        password: OWNER_PASSWORD,
        firstName: 'Test',
        lastName: 'Owner',
        role: 'shop_owner',
      }),
    });
    console.log('Registered shop owner');
  } catch (err) {
    console.log('Owner may already exist:', err.message);
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: OWNER_EMAIL, password: OWNER_PASSWORD }),
  });
  const token = login.data?.token;
  if (!token) throw new Error('Login failed — no token');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const shopIdByName = Object.fromEntries(
    (existing.data || []).map((s) => [s.name, s._id || s.id])
  );

  for (let i = 0; i < shops.length; i += 1) {
    const shopPayload = shops[i];
    let shopId = shopIdByName[shopPayload.name];

    if (!shopId) {
      const created = await request('/shops', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(shopPayload),
      });
      shopId = created.data?._id || created.data?.id;
      console.log(`Created shop: ${shopPayload.name} (${shopId})`);
    } else {
      console.log(`Using existing shop: ${shopPayload.name}`);
    }

    const productList = productsByShopIndex[i] || [];
    for (const product of productList) {
      await request('/products', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ...product, shop: shopId }),
      });
      console.log(`  + product: ${product.name}`);
    }
  }

  const after = await request('/shops?limit=10');
  console.log(`\nDone. Live shops: ${after.pagination?.total}`);
  console.log(`Login as shop owner: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
