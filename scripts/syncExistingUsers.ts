import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../generated/prisma';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();

async function main() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const users = await prisma.userProfile.findMany();

  console.log(`Syncing ${users.length} users...`);

  let synced = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      await clerk.users.updateUserMetadata(user.userId, {
        publicMetadata: { role: user.role },
      });
      console.log(`✓ ${user.userId} → ${user.role}`);
      synced++;
    } catch (err: any) {
      if (err?.status === 404) {
        console.log(`⚠ Skipped (not in Clerk): ${user.userId}`);
        skipped++;
      } else {
        console.error(`✗ Error on ${user.userId}:`, err.message);
      }
    }
  }

  console.log(`\nDone. Synced: ${synced}, Skipped: ${skipped}`);
}

main().finally(() => prisma.$disconnect());