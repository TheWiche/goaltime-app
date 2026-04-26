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
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
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
        <Divider sx={{ my: 1 }} />
        <MDBox display="flex" alignItems="center">
          <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
            <Icon>schedule</Icon>
          </MDTypography>
          <MDTypography variant="button" color="text" fontWeight="light">
            {date}
          </MDTypography>
        </MDBox>
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
