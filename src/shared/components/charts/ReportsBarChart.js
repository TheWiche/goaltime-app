import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import ChartFrame from "./ChartFrame";
import { baseOptions, resolveColor } from "./chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/** Barras rectas (sin radio), rejilla horizontal sutil. */
function ReportsBarChart({ color, title, description, date, chart }) {
  const hex = resolveColor(color);

  const chartData = useMemo(
    () => ({
      labels: chart.labels || [],
      datasets: [
        {
          label: chart.datasets?.label || "Data",
          data: chart.datasets?.data || [],
          backgroundColor: hex,
          hoverBackgroundColor: hex,
          borderWidth: 0,
          borderRadius: 0,
          maxBarThickness: 36,
          categoryPercentage: 0.6,
          barPercentage: 0.9,
        },
      ],
    }),
    [chart, hex]
  );

  const chartOptions = useMemo(() => baseOptions(), []);

  return (
    <ChartFrame title={title} description={description} date={date}>
      <Bar data={chartData} options={chartOptions} aria-label={title || chart.datasets?.label || "Gráfico de barras"} role="img" />
    </ChartFrame>
  );
}

ReportsBarChart.defaultProps = {
  color: "info",
  description: "",
};

ReportsBarChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsBarChart;
