import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gadgets = [
    {
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      category: 'smartphone' as const,
      specs: {
        camera: '48MP Main, 12MP Ultra-wide, 12MP 3x Telephoto',
        battery: '3274 mAh, USB-C 27W',
        processor: 'Apple A17 Pro',
        display: '6.1" Super Retina XDR, 120Hz ProMotion',
        ram: '8GB',
        storage: '128GB / 256GB / 512GB / 1TB',
        os: 'iOS 17',
        price: 19999000,
      },
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      category: 'smartphone' as const,
      specs: {
        camera: '200MP Main, 12MP Ultra-wide, 10MP 3x, 50MP 5x',
        battery: '5000 mAh, 45W fast charging',
        processor: 'Snapdragon 8 Gen 3',
        display: '6.8" Dynamic AMOLED 2X, 120Hz',
        ram: '12GB',
        storage: '256GB / 512GB / 1TB',
        os: 'Android 14',
        price: 21999000,
      },
      imageUrl: 'https://images.unsplash.com/photo-1707195580797-1e72a2b0afde?w=400',
    },
    {
      name: 'Google Pixel 8 Pro',
      brand: 'Google',
      category: 'smartphone' as const,
      specs: {
        camera: '50MP Main, 48MP Ultra-wide, 48MP 5x Telephoto',
        battery: '5050 mAh, 30W wired',
        processor: 'Google Tensor G3',
        display: '6.7" LTPO OLED, 120Hz',
        ram: '12GB',
        storage: '128GB / 256GB / 1TB',
        os: 'Android 14',
        price: 14999000,
      },
      imageUrl: 'https://images.unsplash.com/photo-1696426132316-9dc29fcd2f80?w=400',
    },
    {
      name: 'POCO F6',
      brand: 'Xiaomi',
      category: 'smartphone' as const,
      specs: {
        camera: '50MP Main, 8MP Ultra-wide',
        battery: '5000 mAh, 90W fast charging',
        processor: 'Snapdragon 8s Gen 3',
        display: '6.67" AMOLED, 120Hz',
        ram: '12GB',
        storage: '256GB / 512GB',
        os: 'Android 14',
        price: 6999000,
      },
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    },
    {
      name: 'Nothing Phone (2a)',
      brand: 'Nothing',
      category: 'smartphone' as const,
      specs: {
        camera: '50MP Main, 50MP Ultra-wide',
        battery: '5000 mAh, 45W fast charging',
        processor: 'MediaTek Dimensity 7200 Pro',
        display: '6.7" AMOLED, 120Hz',
        ram: '8GB / 12GB',
        storage: '128GB / 256GB',
        os: 'Android 14',
        price: 5999000,
      },
      imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
    },
  ];

  for (const gadget of gadgets) {
    await prisma.gadget.upsert({
      where: { id: gadget.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: gadget,
    });
  }

  const communities = [
    { name: 'iPhone Community', slug: 'iphone', description: 'Komunitas pengguna iPhone Indonesia' },
    { name: 'Android Enthusiast', slug: 'android', description: 'Diskusi semua hal tentang Android' },
    { name: 'Unboxing & Review', slug: 'unboxing', description: 'Share unboxing dan first impressions' },
    { name: 'Budget Gadget', slug: 'budget', description: 'Gadget terbaik di kelasnya' },
  ];

  for (const community of communities) {
    await prisma.community.upsert({
      where: { slug: community.slug },
      update: {},
      create: community,
    });
  }

  console.log('✅ Seed complete: 5 gadgets, 4 communities');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
