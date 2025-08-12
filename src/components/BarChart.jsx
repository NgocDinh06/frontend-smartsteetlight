import { useEffect, useState } from "react";
import { useTheme, Box, Typography } from "@mui/material"; // Thêm Box và Typography
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { useLightState } from "../App";

const BarChart = ({ isDashboard = false, dataType = "isOn" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightStates } = useLightState();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Tạo dữ liệu cho biểu đồ cột từ lightStates
      const data = Object.keys(lightStates).map((lightId, index) => ({
        lightId: `Đèn ${lightId}`,
        value: dataType === "isOn" ? (lightStates[lightId].isOn ? 1 : 0) :
               dataType === "brightness" ? lightStates[lightId].brightness :
               lightStates[lightId].power,
        color: ["#0cf7d0ff", "#813bf2ff", "#f0baa3ff","#fda49cff", "#daf47aff", "#81f3abff","#f186daff"][index % 7], // Màu riêng cho mỗi đèn
      }));

      setChartData(data);
    }, 1000);

    return () => clearInterval(interval);
  }, [lightStates, dataType]);

  return (
    <ResponsiveBar
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            background: colors.primary[500],
            color: colors.grey[100],
          },
        },
      }}
      keys={["value"]}
      indexBy="lightId"
      margin={{ top: 50, right: isDashboard ? 50 : 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{
        type: "linear",
        min: dataType === "isOn" ? 0 : 0,
        max: dataType === "isOn" ? 1 : dataType === "brightness" ? 100 : 200,
      }}
      indexScale={{ type: "band", round: true }}
      colors={({ data }) => data.color}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Bóng đèn",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        tickValues: dataType === "isOn" ? [0, 1] : dataType === "brightness" ? [0, 20, 40, 60, 80, 100] : [0, 50, 100, 150, 200],
        legend: isDashboard ? undefined : dataType === "isOn" ? "Trạng thái (0: Tắt, 1: Bật)" : dataType === "brightness" ? "Độ sáng (%)" : dataType === "power" ? "Công suất (W)" : "",
        legendPosition: "middle",
        legendOffset: -40,
        format: dataType === "isOn" ? (v) => v === 1 ? "Bật" : "Tắt" : undefined,
      }}
      valueFormat={dataType === "isOn" ? (v) => v === 1 ? "Bật" : "Tắt" : dataType === "brightness" ? (v) => `${v}%` : (v) => `${v}W`}
      enableLabel={true}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={
        isDashboard ? [] : [
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]
      }
      role="application"
      barAriaLabel={(e) => `${e.id}: ${e.formattedValue} for ${e.indexValue}`}
      tooltip={({ id, value, indexValue, color }) => (
        <Box sx={{ background: colors.primary[500], color: colors.grey[100], p: 1 }}>
          <Typography>{indexValue}</Typography>
          <Typography>
            {id}: {dataType === "isOn" ? (value === 1 ? "Bật" : "Tắt") : dataType === "brightness" ? `${value}%` : `${value}W`}
          </Typography>
        </Box>
      )}
    />
  );
};

export default BarChart;