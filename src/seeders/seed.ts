import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const userData: Prisma.UserCreateInput[] = [
  {
    firstName: "Miguel",
    lastName: "Garcia",
    phone: "1234567890",
    password: "",
    randToken: "",
  },
];

async function main() {
  for (const u of userData) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(u.password, salt);
    await prisma.user.createMany({
      data: [
        {
          ...u,
          password: hashPassword,
        },
      ],
    });
  }
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
