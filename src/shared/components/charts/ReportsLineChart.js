import { useMemo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartFrame from "./ChartFrame";
import { baseOptions, resolveColor, withAlpha } from "./chartTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/** Línea fina (1.5px), sin puntos salvo en hover, relleno plano muy sutil. */
function ReportsLineChart({ color, title, description, date, chart }) {
  const hex = resolveColor(color);

  const chartData = useMemo(
    () => ({
      labels: chart.labels || [],
      datasets: [
        {
          label: chart.datasets?.label || "Data",
          data: chart.datasets?.data || [],
          borderColor: hex,
          backgroundColor: withAlpha(hex, 0.06),
          borderWidth: 1.5,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointHoverBorderWidth: 0,
          pointBackgroundColor: hex,
        },
      ],
    }),
    [chart, hex]
  );

  const chartOptions = useMemo(() => baseOptions(), []);

  return (
    <ChartFrame title={title} description={description} date={date}>
      <Line data={chartData} options={chartOptions} aria-label={title || chart.datasets?.label || "Gráfico de líneas"} role="img" />
    </ChartFrame>
  );
}

ReportsLineChart.defaultProps = {
  color: "info",
  description: "",
};

ReportsLineChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsLineChart;
