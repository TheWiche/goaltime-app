// Tema compartido para Chart.js alineado con el sistema de diseño (Inter, zinc, azul).
export const chartColors = {
  primary: "#2563EB",
  info: "#2563EB",
  secondary: "#52525B",
  dark: "#18181B",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
};

export const chartTokens = {
  grid: "#F4F4F5",
  axis: "#E4E4E7",
  tick: "#71717A",
  tooltipBg: "#18181B",
  font: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export function resolveColor(color) {
  return chartColors[color] || chartColors.primary;
}

/** Convierte #RRGGBB a rgba con alpha. */
export function withAlpha(hex, alpha) {
  const n = parseInt(hex.replace("#", ""), 16);
  // eslint-disable-next-line no-bitwise
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function baseOptions() {
  const font = { family: chartTokens.font, size: 11 };
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: chartTokens.tooltipBg,
        titleColor: "#FFFFFF",
        bodyColor: "#E4E4E7",
        titleFont: { ...font, size: 12, weight: "600" },
        bodyFont: { ...font, size: 12 },
        padding: 8,
        cornerRadius: 4,
        displayColors: false,
        caretSize: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: chartTokens.grid, drawTicks: false },
        ticks: { color: chartTokens.tick, font, padding: 8, precision: 0 },
      },
      x: {
        border: { color: chartTokens.axis },
        grid: { display: false },
        ticks: { color: chartTokens.tick, font, padding: 6 },
      },
    },
  };
}
