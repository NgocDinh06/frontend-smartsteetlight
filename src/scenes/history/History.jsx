import { Box, Typography, List, ListItem, ListItemText, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useLightState } from "../../App";

const History = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightHistory, completedEvents } = useLightState();

  const calculateTotalActiveTime = (lightId) => {
    const historyForLight = lightHistory.filter((entry) => entry.lightId === lightId && entry.action === "on");
    return historyForLight.reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <Box m="20px">
      <Typography variant="h3" color={colors.grey[100]} sx={{ mb: "20px" }}>
        Lịch sử
      </Typography>

      <Box mb="30px">
        <Typography variant="h5" color={colors.grey[100]} sx={{ mb: "15px" }}>
          Lịch sử bật/tắt
        </Typography>
        {Object.keys(lightHistory.reduce((acc, entry) => {
          acc[entry.lightId] = true;
          return acc;
        }, {})).map((lightId) => (
          <Box key={lightId} mb="20px">
            <Typography color={colors.grey[100]} variant="h6" sx={{ mb: "10px" }}>
              Bóng đèn {lightId}
            </Typography>
            <List>
              {lightHistory
                .filter((entry) => entry.lightId === lightId)
                .map((entry, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      backgroundColor: entry.action === "on" ? colors.greenAccent[500] : colors.redAccent[500],
                      margin: "5px 0",
                      borderRadius: "4px",
                    }}
                  >
                    <ListItemText
                      primary={`${entry.action === "on" ? "Bật" : "Tắt"}`}
                      secondary={`${new Date(entry.start).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${new Date(entry.end).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} (${entry.duration.toFixed(2)} phút)`}
                    />
                  </ListItem>
                ))}
            </List>
            <Typography color={colors.grey[300]} variant="body2">
              Tổng thời gian hoạt động: {calculateTotalActiveTime(lightId).toFixed(2)} phút
            </Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Typography variant="h5" color={colors.grey[100]} sx={{ mb: "15px" }}>
          Lịch sử hẹn giờ
        </Typography>
        <List>
          {completedEvents.map((event, index) => (
            <ListItem
              key={index}
              sx={{
                backgroundColor: event.extendedProps.action === "on" ? colors.greenAccent[500] : colors.redAccent[500],
                margin: "10px 0",
                borderRadius: "4px",
              }}
            >
              <ListItemText
                primary={event.title}
                secondary={
                  <Typography>
                    {new Date(event.start).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {event.end && ` - ${new Date(event.end).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default History;