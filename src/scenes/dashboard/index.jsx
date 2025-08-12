import { Box, Button, IconButton, Typography, useTheme, Alert } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import ProgressCircle from "../../components/ProgressCircle";
import { useNavigate } from "react-router-dom";
import { useLightState } from "../../App";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useState, useEffect } from "react";
import { formatDate } from "@fullcalendar/react";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { lightStates, setLightStates, currentEvents, syncLightStatesWithSchedule } = useLightState();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const activeEvents = syncLightStatesWithSchedule(now);

      if (activeEvents.length > 0) {
        setStatusMessage(
          `Đang áp dụng lịch trình: ${activeEvents
            .map(
              (e) =>
                `${e.extendedProps.lightId} (${
                  e.extendedProps.action === "on" ? "Bật" : "Tắt"
                } từ ${formatDate(e.start, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })} ${e.end ? "đến " + formatDate(e.end, { hour: "2-digit", minute: "2-digit", hour12: false }) : ""})`
            )
            .join(", ")}`
        );
      } else {
        setStatusMessage("Không có lịch trình đang hoạt động.");
      }
      console.log("Dashboard - Current Events:", currentEvents, "Light States:", lightStates); // Debug
    }, 1000);
    return () => clearInterval(interval);
  }, [currentEvents, lightStates, setLightStates, syncLightStatesWithSchedule]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              mr: 2,
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
          <Button
            onClick={handleLogout}
            sx={{
              backgroundColor: colors.redAccent[500],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.redAccent[600] },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {statusMessage && (
        <Alert severity="info" sx={{ mb: "20px" }}>
          {statusMessage}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box mt="25px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
              Trạng thái thực của điện áp
            </Typography>
            <IconButton>
              <DownloadOutlinedIcon sx={{ fontSize: "26px", color: colors.greenAccent[500] }} />
            </IconButton>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Trạng thái bóng đèn
            </Typography>
          </Box>
          <Box p="15px">
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>
              Tổng số đèn: {Object.keys(lightStates).length}
            </Typography>
            {Object.keys(lightStates).map((lightId) => (
              <Box key={lightId} mb="15px" sx={{ display: "flex", alignItems: "center" }}>
                {lightStates[lightId].isOn ? (
                  <LightbulbIcon sx={{ color: colors.greenAccent[500], fontSize: "24px", mr: "10px" }} />
                ) : (
                  <LightbulbOutlinedIcon sx={{ color: colors.grey[500], fontSize: "24px", mr: "10px" }} />
                )}
                <Box>
                  <Typography color={colors.grey[100]} variant="h6">
                    Bóng đèn {lightId}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={lightStates[lightId].isOn ? colors.greenAccent[500] : colors.redAccent[500]}
                  >
                    Trạng thái: {lightStates[lightId].isOn ? "Bật" : "Tắt"}
                  </Typography>
                  <Typography variant="body2" color={colors.grey[300]}>
                    Công suất: {lightStates[lightId].power}W
                  </Typography>
                  <Typography variant="body2" color={colors.grey[300]}>
                    Độ sáng: {lightStates[lightId].brightness}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Công suất tiêu thụ
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="25px">
            <ProgressCircle size="125" />
            <Typography variant="h5" color={colors.greenAccent[500]} sx={{ mt: "15px" }}>
              $48,352
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Trạng thái bóng đèn
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Bản đồ đèn
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;