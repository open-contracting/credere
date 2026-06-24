import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartData } from "../schemas/statitics";
import { t } from "../util/i18n";

interface ChartsProps {
  data: ChartData[];
}

const COLORS_TO_FILL = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#82ca9d",
  "#8884d8",
  "var(--color-dark-green)",
  "var(--color-red)",
  "var(--color-yellow)",
];

const labelFormatterBase = (_label: unknown, payload: unknown, labelMapper?: (label: string) => string) => {
  if (!Array.isArray(payload) || !payload[0]?.payload?.name) {
    return "";
  }
  if (labelMapper) {
    return t(labelMapper(payload[0].payload.name));
  }
  return t(payload[0].payload.name);
};

export function ChartPie({ data }: ChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS_TO_FILL[index % COLORS_TO_FILL.length]} />
          ))}
        </Pie>
        <Tooltip separator=" " labelFormatter={labelFormatterBase} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartBar({ data }: ChartsProps) {
  return (
    <ResponsiveContainer width="100%" height="95%">
      <BarChart width={140} data={data}>
        <Tooltip
          labelFormatter={labelFormatterBase}
          formatter={(value: unknown) => [String(value), ""]}
          separator=""
          cursor={{ stroke: "var(--color-field-border)", strokeWidth: 0.5, fill: "transparent" }}
        />
        <Bar dataKey="value" fill="var(--color-dark-green)" minPointSize={1} />
      </BarChart>
    </ResponsiveContainer>
  );
}
