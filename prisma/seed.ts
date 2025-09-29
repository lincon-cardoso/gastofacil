import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { name: "Free" },
    update: {
      budgetLimit: 2, // Até 2 carteiras
      transactionLimit: 20, // 20 categorias
      features: [
        "Dashboard básico",
        "Orçamentos simples",
        "Relatórios mensais",
      ],
    },
    create: {
      name: "Free",
      price: 0,
      budgetLimit: 2,
      transactionLimit: 20,
      features: [
        "Dashboard básico",
        "Orçamentos simples",
        "Relatórios mensais",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {
      budgetLimit: undefined, // Carteiras ilimitadas
      transactionLimit: undefined, // Categorias ilimitadas
      features: [
        "Alertas inteligentes",
        "Categorias ilimitadas",
        "Exportação CSV/OFX",
        "Relatórios avançados",
        "Suporte prioritário",
      ],
    },
    create: {
      name: "Pro",
      price: 19.0,
      budgetLimit: undefined,
      transactionLimit: undefined,
      features: [
        "Alertas inteligentes",
        "Categorias ilimitadas",
        "Exportação CSV/OFX",
        "Relatórios avançados",
        "Suporte prioritário",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { name: "Premium" },
    update: {
      budgetLimit: undefined, // Carteiras ilimitadas
      transactionLimit: undefined, // Categorias ilimitadas
      features: [
        "Metas e previsão de fluxo",
        "Contas compartilhadas",
        "Anexos de comprovantes",
        "Integração bancária (Beta)",
      ],
    },
    create: {
      name: "Premium",
      price: 38.0,
      budgetLimit: undefined,
      transactionLimit: undefined,
      features: [
        "Metas e previsão de fluxo",
        "Contas compartilhadas",
        "Anexos de comprovantes",
        "Integração bancária (Beta)",
      ],
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
