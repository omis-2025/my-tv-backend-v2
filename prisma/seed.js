require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Super admin
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@mytv.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@mytv.com',
      password: hashed,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin seeded:', admin.email);

  // Packages
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { id: 'pkg-basic' },
      update: { stripePriceId: 'price_1TkU2ZDsA2tn7MZ4uauEEseW' },
      create: { id: 'pkg-basic', name: 'Basic', price: 4.99, durationDays: 30, maxStreams: 1, features: ['SD Streams', '500+ Channels'], stripePriceId: 'price_1TkU2ZDsA2tn7MZ4uauEEseW' },
    }),
    prisma.package.upsert({
      where: { id: 'pkg-standard' },
      update: { stripePriceId: 'price_1TkU4GDsA2tn7MZ4rdpK5F41' },
      create: { id: 'pkg-standard', name: 'Standard', price: 9.99, durationDays: 30, maxStreams: 2, features: ['HD Streams', '1000+ Channels', 'EPG'], stripePriceId: 'price_1TkU4GDsA2tn7MZ4rdpK5F41' },
    }),
    prisma.package.upsert({
      where: { id: 'pkg-premium' },
      update: { stripePriceId: 'price_1TkU52DsA2tn7MZ4z1IzIQ58' },
      create: { id: 'pkg-premium', name: 'Premium', price: 14.99, durationDays: 30, maxStreams: 4, features: ['4K Streams', '5000+ Channels', 'EPG', 'VOD', 'Multi-screen'], stripePriceId: 'price_1TkU52DsA2tn7MZ4z1IzIQ58' },
    }),
  ]);
  console.log('Packages seeded:', packages.map(p => p.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
