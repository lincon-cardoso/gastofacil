import { NextRequest, NextResponse } from "next/server";

interface ValidatePlanRequest {
  plan: string;
  valor: number;
  periodo: string;
  originalPeriod: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se há conteúdo no body
    const contentType = request.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type deve ser application/json" },
        { status: 400 }
      );
    }

    // Tentar ler o body como texto primeiro
    const bodyText = await request.text();

    if (!bodyText || bodyText.trim() === "") {
      return NextResponse.json(
        { error: "Body da requisição está vazio" },
        { status: 400 }
      );
    }

    // Tentar fazer parse do JSON
    let requestData: ValidatePlanRequest;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      return NextResponse.json(
        { error: "JSON inválido no body da requisição" },
        { status: 400 }
      );
    }

    const { plan, valor, periodo, originalPeriod } = requestData;

    // Validar planos conhecidos (sem dependência do banco por enquanto)
    const validPlans = ["pro", "premium"];

    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: "Tipo de plano inválido" },
        { status: 400 }
      );
    }

    // Validar se o preço está correto
    let expectedPrice: number;

    if (plan === "pro") {
      expectedPrice = originalPeriod === "Mensal" ? 19 : 190;
    } else if (plan === "premium") {
      expectedPrice = originalPeriod === "Mensal" ? 38 : 380;
    } else {
      return NextResponse.json(
        { error: "Tipo de plano inválido" },
        { status: 400 }
      );
    }

    if (valor !== expectedPrice) {
      return NextResponse.json(
        { error: "Preço inválido para o plano selecionado" },
        { status: 400 }
      );
    }

    // Validar período
    const expectedPeriod = originalPeriod === "Mensal" ? "/mês" : "/ano";
    if (periodo !== expectedPeriod) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      planData: {
        name: plan,
        price: expectedPrice,
        period: originalPeriod,
      },
      message: "Plano validado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao validar plano:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
