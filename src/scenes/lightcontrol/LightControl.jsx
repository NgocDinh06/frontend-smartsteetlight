import { useState } from "react";
import { Box, Typography, useTheme, Button, Slider, TextField, Alert } from "@mui/material";
import { tokens } from "../../theme";
import { useLightState } from "../../App";
import Header from "../../components/Header";

const LightControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightStates, setLightStates, lightHistory, setLightHistory, syncLightStatesWithSchedule } = useLightState();
  const [localBrightness, setLocalBrightness] = useState({});
  const [newLightId, setNewLightId] = useState("");
  const [error, setError] = useState("");

  const handleToggleLight = (lightId) => {
    const newState = !lightStates[lightId].isOn;
    const now = new Date();
    setLightStates((prev) => {
      const newStates = {
        ...prev,
        [lightId]: {
          ...prev[lightId],
          isOn: newState,
          manualOverride: true,
          lastOffEvent: null,
          lastManualAction: now.toISOString(),
        },
      };
      syncLightStatesWithSchedule(now);
      return newStates;
    });
    setLightHistory((prev) => [
      ...prev,
      {
        lightId,
        action: newState ? "on" : "off",
        start: now,
        end: now,
        duration: 0,
        timestamp: now,
      },
    ]);
  };

  const handleBrightnessChange = (lightId, newValue) => {
    setLocalBrightness((prev) => ({ ...prev, [lightId]: newValue }));
  };

  const handleBrightnessChangeCommitted = (lightId, newValue) => {
    const now = new Date();
    setLightStates((prev) => {
      const newStates = {
        ...prev,
        [lightId]: {
          ...prev[lightId],
          brightness: newValue,
          manualOverride: true,
          lastOffEvent: null,
          lastManualAction: now.toISOString(),
        },
      };
      syncLightStatesWithSchedule(now);
      return newStates;
    });
    setLightHistory((prev) => [
      ...prev,
      {
        lightId,
        action: `brightness ${newValue}%`,
        start: now,
        end: now,
        duration: 0,
        timestamp: now,
      },
    ]);
  };

  const handleAddLight = () => {
    if (!newLightId.trim()) {
      setError("Vui lòng nhập ID cho bóng đèn!");
      return;
    }
    if (lightStates[newLightId]) {
      setError("ID bóng đèn đã tồn tại!");
      return;
    }

    const now = new Date();
    setLightStates((prev) => ({
      ...prev,
      [newLightId]: {
        isOn: false,
        power: 100,
        brightness: 50,
        manualOverride: false,
        lastOffEvent: null,
        lastManualAction: null,
      },
    }));
    setLightHistory((prev) => [
      ...prev,
      {
        lightId: newLightId,
        action: "added",
        start: now,
        end: now,
        duration: 0,
        timestamp: now,
      },
    ]);
    setNewLightId("");
    setError("");
  };

  const handleDeleteLight = (lightId) => {
    if (window.confirm(`Bạn có chắc muốn xóa bóng đèn ${lightId}?`)) {
      const now = new Date();
      setLightStates((prev) => {
        const newStates = { ...prev };
        delete newStates[lightId];
        syncLightStatesWithSchedule(now);
        return newStates;
      });
      setLightHistory((prev) => [
        ...prev,
        {
          lightId,
          action: "deleted",
          start: now,
          end: now,
          duration: 0,
          timestamp: now,
        },
      ]);
      setLocalBrightness((prev) => {
        const newBrightness = { ...prev };
        delete newBrightness[lightId];
        return newBrightness;
      });
    }
  };

  return (
    <Box m="20px">
      <Header title="Điều khiển đèn" subtitle="Bật/tắt, điều chỉnh độ sáng và quản lý bóng đèn" />
      <Box mb="20px">
        <Box display="flex" alignItems="center" gap="10px">
          <TextField
            label="ID bóng đèn mới"
            value={newLightId}
            onChange={(e) => setNewLightId(e.target.value)}
            sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleAddLight}
            sx={{ height: "40px" }}
          >
            Thêm bóng đèn
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: "10px" }}>
            {error}
          </Alert>
        )}
      </Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="180px"
        gap="20px"
      >
        {Object.keys(lightStates).map((lightId) => (
          <Box
            key={lightId}
            gridColumn="span 4"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Đèn {lightId}
            </Typography>
            <Typography color={colors.grey[100]}>
              Trạng thái: {lightStates[lightId].isOn ? "Bật" : "Tắt"}
            </Typography>
            <Box display="flex" gap="10px" mt="10px" mb="10px">
              <Button
                variant="contained"
                color={lightStates[lightId].isOn ? "error" : "success"}
                onClick={() => handleToggleLight(lightId)}
              >
                {lightStates[lightId].isOn ? "Tắt" : "Bật"}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteLight(lightId)}
              >
                Xóa
              </Button>
            </Box>
            <Typography color={colors.grey[100]}>Độ sáng:</Typography>
            <Slider
              value={localBrightness[lightId] || lightStates[lightId].brightness}
              onChange={(e, value) => handleBrightnessChange(lightId, value)}
              onChangeCommitted={(e, value) => handleBrightnessChangeCommitted(lightId, value)}
              min={0}
              max={100}
              step={1}
              sx={{ width: "80%", color: colors.greenAccent[500] }}
            />
            <Typography color={colors.grey[100]}>
              {localBrightness[lightId] || lightStates[lightId].brightness}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};//

export default LightControl;