import { prisma } from "../lib/prisma.js";
import { clearUploads } from "../utils/fileHelper.js";

async function main() {
  console.log("Cleaning uploads directory...");
  await clearUploads();
  console.log("Uploads directory cleaned.");
  
  // Add your seeding logic here if needed
  // Example:
  // await prisma.user.create({ ... })
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

