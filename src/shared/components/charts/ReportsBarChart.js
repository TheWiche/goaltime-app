import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Clock } from "lucide-react";
import { MDBox, MDTypography } from "shared/components/md-shims";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ReportsBarChart({ color, title, description, date, chart }) {
  const chartData = useMemo(
    () => ({
      labels: chart.labels || [],
      datasets: [
        {
          label: chart.datasets.label || "Data",
          data: chart.datasets.data || [],
          backgroundColor: "rgba(25, 212, 112, 0.8)",
          borderColor: "rgba(25, 212, 112, 1)",
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    }),
    [chart]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: true, color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <MDBox>
      <MDBox
        variant="gradient"
        bgColor={color}
        borderRadius="lg"
        coloredShadow={color}
        py={2}
        pr={0.5}
        height="12.5rem"
        mb={2}
      >
        <Bar data={chartData} options={chartOptions} />
      </MDBox>
      <MDBox>
        <MDTypography variant="h6" textTransform="capitalize" mb={1}>
          {title}
        </MDTypography>
        <MDTypography component="div" variant="button" color="text" fontWeight="light" mb={1}>
          {description}
        </MDTypography>
        <hr className="my-2 border-slate-200" />
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
          <MDTypography variant="button" color="text" fontWeight="light">
            {date}
          </MDTypography>
        </div>
      </MDBox>
    </MDBox>
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
