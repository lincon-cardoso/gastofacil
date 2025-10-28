import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed dos planos
  await prisma.plan.upsert({
    where: { name: "Free" },
    update: {
      price: 0,
      budgetLimit: 2, // Até 2 carteiras
      transactionLimit: 20, // 20 categorias
      features: [
        "Dashboard básico",
        "Até 2 carteiras",
        "Orçamentos simples",
        "Relatórios mensais",
      ],
    },
    create: {
      name: "Free",
      price: 0,
      description: "O essencial para começar bem",
      budgetLimit: 2,
      transactionLimit: 20,
      features: [
        "Dashboard básico",
        "Até 2 carteiras",
        "Orçamentos simples",
        "Relatórios mensais",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {
      price: 19.0,
      budgetLimit: 0, // Ilimitado (0 = sem limite)
      transactionLimit: 0, // Ilimitado
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
      description: "Para quem quer ir além com automação",
      budgetLimit: 0,
      transactionLimit: 0,
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
      price: 38.0,
      budgetLimit: 0, // Ilimitado
      transactionLimit: 0, // Ilimitado
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
      description: "Poder máximo para avançados e famílias",
      budgetLimit: 0,
      transactionLimit: 0,
      features: [
        "Metas e previsão de fluxo",
        "Contas compartilhadas",
        "Anexos de comprovantes",
        "Integração bancária (Beta)",
      ],
    },
  });

  console.log("✅ Planos criados/atualizados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
