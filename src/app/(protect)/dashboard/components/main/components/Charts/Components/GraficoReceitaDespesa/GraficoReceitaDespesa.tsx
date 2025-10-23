// Hooks e dependências do React/Next
import { useUserData } from "@/hooks/useUserData";
import { useTransactions } from "@/hooks/useTransactions";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
// Estilos via CSS Module (escopo local)
import styles from "./GraficoReceitaDespesa.module.scss";

// Tipo de um ponto no gráfico (coordenadas e metadados para tooltip/labels)
interface Point {
  x: number;
  y: number;
  value: number;
  description: string;
  date: string;
  category?: string;
}

// Configurações visuais do gráfico (cores, fontes, espaçamento)
interface ChartConfig {
  padding: number;
  colors: {
    positive: string;
    negative: string;
    line: string;
    grid: string;
    axis: string;
    text: string;
  };
  fonts: {
    title: string;
    label: string;
  };
}

// Estrutura do estado usado para o tooltip
interface TooltipData {
  x: number;
  y: number;
  content: string;
  visible: boolean;
}

export default function GraficoReceitaDespesa() {
  // Referência do <canvas> para desenhar via API 2D
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Referência do container para posicionar tooltip, se necessário
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado do tooltip (posição, conteúdo e visibilidade)
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    content: "",
    visible: false,
  });

  // Carrega estado de usuário (controle de loading/erro)
  const { isLoading, isError } = useUserData();

  // Carrega transações e seus estados de loading/erro
  const {
    transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useTransactions();

  // Configurações fixas do gráfico (memoizadas para não recriar a cada render)
  const chartConfig: ChartConfig = useMemo(
    () => ({
      padding: 60,
      colors: {
        positive: "#22c55e", // Cor para pontos/valores positivos
        negative: "#ef4444", // Cor para pontos/valores negativos
        line: "#3b82f6", // Cor da linha principal do gráfico
        grid: "#27272a", // Cor das linhas de grade
        axis: "#52525b", // Cor dos eixos
        text: "#f1f5f9", // Cor do texto (eixos, título)
      },
      fonts: {
        title: "bold 16px Inter, Arial, sans-serif",
        label: "12px Inter, Arial, sans-serif",
      },
    }),
    []
  );

  // Transforma a lista de transações em uma série mensal (saldo líquido)
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Agrupa transações por mês (YYYY-MM)
    const groupedByMonth = transactions.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            revenue: 0,
            expenses: 0,
            transactions: [],
          };
        }

        // Soma receitas (amount > 0) e despesas (amount < 0)
        const amount = Number(transaction.amount);
        if (amount > 0) {
          acc[monthKey].revenue += amount;
        } else {
          acc[monthKey].expenses += Math.abs(amount);
        }

        acc[monthKey].transactions.push(transaction);
        return acc;
      },
      {} as Record<
        string,
        { revenue: number; expenses: number; transactions: unknown[] }
      >
    );

    // Converte o agrupamento em array ordenado por mês com campos prontos pro gráfico
    return Object.entries(groupedByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data], index) => {
        const [year, month] = monthKey.split("-");
        const netValue = data.revenue - data.expenses;

        return {
          x: index,
          y: netValue,
          value: netValue,
          description: `Saldo líquido: R$ ${netValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          date: `${month}/${year}`,
          category: `Receitas: R$ ${data.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Despesas: R$ ${data.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        };
      });
  }, [transactions]);

  // Utilitário para formatar valores em BRL
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  // Função principal que desenha todo o gráfico no canvas
  const drawChart = useCallback(
    (canvas: HTMLCanvasElement, points: Point[]) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { padding, colors, fonts } = chartConfig;

      // Ajuste para telas retina (maior densidade de pixels)
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      const width = rect.width - 2 * padding;
      const height = rect.height - 2 * padding;

      // Limpa a área de desenho
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Estado vazio: nenhuma transação
      if (points.length === 0) {
        ctx.fillStyle = "#666";
        ctx.font = "16px Inter, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📊", rect.width / 2, rect.height / 2 - 20);
        ctx.fillText(
          "Nenhuma transação encontrada",
          rect.width / 2,
          rect.height / 2 + 10
        );
        return;
      }

      // Calcula mínimo/máximo para escalar o eixo Y (inclui zero)
      const values = points.map((p) => p.value);
      const minValue = Math.min(...values, 0);
      const maxValue = Math.max(...values, 0);
      const valueRange = maxValue - minValue || 1;

      // Desenha eixos X e Y
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;

      // Eixo Y
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, padding + height);
      ctx.stroke();

      // Eixo X
      ctx.beginPath();
      ctx.moveTo(padding, padding + height);
      ctx.lineTo(padding + width, padding + height);
      ctx.stroke();

      // Grade horizontal + labels do eixo Y
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();

        // Texto do eixo Y (valores escalados)
        const value = maxValue - (valueRange / 5) * i;
        ctx.fillStyle = colors.text;
        ctx.font = fonts.label;
        ctx.textAlign = "right";
        ctx.fillText(formatCurrency(value), padding - 10, y + 4);
      }

      // Linha pontilhada em Y=0 quando há positivos e negativos
      if (minValue < 0 && maxValue > 0) {
        const zeroY = padding + height - ((0 - minValue) / valueRange) * height;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(padding + width, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Converte os pontos normalizados (index/valor) para coordenadas de tela
      const chartPoints = points.map((point, index) => {
        const xPos =
          points.length === 1
            ? padding + width / 2
            : padding + (width / (points.length - 1)) * index;

        const yPos =
          padding + height - ((point.value - minValue) / valueRange) * height;

        return { ...point, x: xPos, y: yPos };
      });

      // Desenha a linha conectando os pontos (se houver 2+ pontos)
      if (chartPoints.length >= 2) {
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        chartPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }

      // Desenha marcadores circulares em cada ponto
      chartPoints.forEach((point) => {
        // Sombra para dar destaque ao ponto
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Círculo principal (cor varia com sinal do valor)
        ctx.fillStyle = point.value >= 0 ? colors.positive : colors.negative;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Remove sombra para traço/miolo
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Borda branca do ponto
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Miolo menor (mesma cor do ponto)
        ctx.fillStyle = point.value >= 0 ? colors.positive : colors.negative;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Labels do eixo X (mês/ano sob cada ponto)
      ctx.fillStyle = colors.text;
      ctx.font = fonts.label;
      ctx.textAlign = "center";

      chartPoints.forEach((point) => {
        ctx.fillText(point.date, point.x, padding + height + 20);
      });

      // Título centralizado na parte superior
      ctx.fillStyle = colors.text;
      ctx.font = fonts.title;
      ctx.textAlign = "center";
      ctx.fillText("Saldo Mensal - Receitas vs Despesas", rect.width / 2, 30);

      // Retorna pontos com coordenadas calculadas (útil para hit-test/tooltip)
      return chartPoints;
    },
    [chartConfig, formatCurrency]
  );

  // Handler de movimento do mouse (placeholder para tooltip dinâmica)
  const handleMouseMove = useCallback(() => {
    // Implementação básica: sempre esconde o tooltip por enquanto
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Effect: desenha/re-desenha o gráfico quando dados mudam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawChart(canvas, chartData);
  }, [chartData, drawChart]);

  // Effect: responsividade (redesenha ao redimensionar janela)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // debounce simples com setTimeout
      setTimeout(() => {
        drawChart(canvas, chartData);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData, drawChart]);

  // Estados de carregamento (skeleton/spinner)
  if (isLoading || transactionsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Carregando dados do gráfico...</p>
        </div>
      </div>
    );
  }

  // Estado de erro (com botão para recarregar a página)
  if (isError || transactionsError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p>Erro ao carregar os dados do gráfico.</p>
          <button onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Estado vazio (sem transações)
  if (!transactions || transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <p>Nenhuma transação encontrada</p>
          <p>Adicione algumas transações para visualizar o gráfico</p>
        </div>
      </div>
    );
  }

  // Render principal: container + canvas + tooltip
  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.chartContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          role="img"
          aria-label="Gráfico de receitas e despesas mensais"
          width={800}
          height={400}
        />
        {/* Tooltip posicionado absoluto (aparece quando tooltip.visible = true) */}
        {tooltip.visible && (
          <div
            className={`${styles.tooltip} ${tooltip.visible ? styles.visible : ""}`}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}
