import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Garante que o plano 'Free' seja criado primeiro
  await prisma.plan.createMany({
    data: [
      {
        name: "Free",
        price: 0,
      },
      {
        name: "Pro",
        price: 29.99,
      },
      {
        name: "Premium",
        price: 59.99,
      },
    ],
    skipDuplicates: true, // Evita duplicação caso os planos já existam
  });

  console.log("Planos criados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
