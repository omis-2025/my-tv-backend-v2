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
      where: { id: 'pkg-free' },
      update: { name: 'Free', price: 0, maxStreams: 1, features: ['50+ Free Channels', 'SD Streams'], stripePriceId: null },
      create: { id: 'pkg-free', name: 'Free', price: 0, durationDays: 36500, maxStreams: 1, features: ['50+ Free Channels', 'SD Streams'], stripePriceId: null },
    }),
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

  // Channels — 60 free demo channels across categories
  const catalog = {
    News: ['BBC News', 'CNN International', 'Al Jazeera', 'Sky News', 'France 24', 'DW News', 'Euronews', 'CNBC', 'Bloomberg', 'CGTN'],
    Sports: ['ESPN', 'Sky Sports', 'beIN Sports', 'Eurosport', 'NBA TV', 'Fox Sports', 'Sport TV', 'DAZN', 'Sky F1', 'Tennis Channel'],
    Movies: ['HBO', 'Cinemax', 'Movie Hub', 'Star Movies', 'AMC', 'Paramount', 'Sony Movies', 'Film4', 'TCM', 'MGM'],
    Entertainment: ['MTV', 'Comedy Central', 'E! Entertainment', 'TLC', 'Fox', 'AXN', 'Warner TV', 'Discovery', 'History', 'National Geographic'],
    Kids: ['Cartoon Network', 'Nickelodeon', 'Disney Channel', 'Boomerang', 'Baby TV', 'PBS Kids', 'Nick Jr', 'Disney Junior', 'CBeebies', 'POP'],
    Music: ['MTV Music', 'VH1', 'Vevo', 'MTV Hits', 'Kiss TV', 'Trace Urban', 'NRJ', 'Clubland TV', 'Now Music', 'The Box'],
  };

  let order = 0;
  const ops = [];
  for (const [category, names] of Object.entries(catalog)) {
    for (const name of names) {
      order += 1;
      const id = `ch-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      ops.push(
        prisma.channel.upsert({
          where: { id },
          update: { name, category, sortOrder: order, isActive: true },
          create: { id, name, category, country: 'INT', language: 'EN', isPremium: false, isActive: true, sortOrder: order, tags: [category] },
        })
      );
    }
  }
  const channels = await Promise.all(ops);
  console.log('Channels seeded:', channels.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
