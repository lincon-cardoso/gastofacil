"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import React from "react";
import "./Charts.scss"; // Importação do arquivo SCSS

// Dados mockados – substitua pelos reais quando integrar com sua API
const lineData = [
  { name: "Jan", receitas: 1000, despesas: 4000 },
  { name: "Feb", receitas: 6200, despesas: 4200 },
  { name: "Mar", receitas: 6400, despesas: 4400 },
  { name: "Apr", receitas: 6600, despesas: 4600 },
  { name: "May", receitas: 6800, despesas: 4800 },
  { name: "Jun", receitas: 7000, despesas: 5000 },
];

const pieData = [
  { name: "Lazer", value: 1000 },
  { name: "Mercado", value: 900 },
  { name: "Moradia", value: 300 },
  { name: "Saúde", value: 200 },
  { name: "Transporte", value: 100 },
];

export default function Charts() {
  return (
    <div className="charts-container">
      {/* Gráfico de Linhas */}
      <div className="line-chart">
        <ResponsiveContainer>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="#22c55e"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza */}
      <div className="pie-chart">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              label
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"][
                      index
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
