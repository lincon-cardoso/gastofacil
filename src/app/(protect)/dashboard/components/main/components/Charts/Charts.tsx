"use client";

import { ResponsiveContainer } from "recharts";
import React from "react";
import "./Charts.scss";
import ListaCategorias from "@/app/(protect)/dashboard/components/main/components/Charts/Components/listacategorias/listaCategorias";
import GraficoReceitaDespesa from "@/app/(protect)/dashboard/components/main/components/Charts/Components/GraficoReceitaDespesa/GraficoReceitaDespesa";

export default function Charts() {
  return (
    <div className="charts-container">
      {/* Gráfico de Linhas - Receitas vs Despesas */}
      <div className="line-chart">
        <GraficoReceitaDespesa />
      </div>

      {/* Gráfico de Pizza - Categorias */}
      <div className="pie-chart">
        <ResponsiveContainer>
          <ListaCategorias />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
