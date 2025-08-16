import { useState } from "react";
import { Box, Typography, useTheme, Button, Slider, TextField, Alert } from "@mui/material";
import { tokens } from "../../theme";
import { useLightState } from "../../App";
import Header from "../../components/Header";

const API_BASE = "/api"; // bạn chỉnh theo backend của bạn

const LightControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightStates, setLightStates, lightHistory, setLightHistory, syncLightStatesWithSchedule } = useLightState();
  const [localBrightness, setLocalBrightness] = useState({});
  const [newLightId, setNewLightId] = useState("");
  const [error, setError] = useState("");

  const apiCall = async (lightId, command, params = {}) => {
  try {
    let token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      return null;
    }

    const doRequest = async (accessToken) => {
      return await fetch(`${API_BASE}/commands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ deviceId: lightId, command, params }),
      });
    };

    let res = await doRequest(token);

    if (res.status === 401) {
      // refresh token như cũ
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi API");
    return data;
  } catch (err) {
    setError(err.message);
    throw err;
  }
};


  const handleToggleLight = async (lightId) => {
  const newState = !lightStates[lightId].isOn;
  const action = newState ? "ON" : "OFF";

  try {
    let token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}/device/${lightId}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi API");

    setLightStates((prev) => ({
      ...prev,
      [lightId]: {
        ...prev[lightId],
        isOn: newState,
      },
    }));
  } catch (err) {
    setError(err.message);
  }
};

  const handleBrightnessChange = (lightId, newValue) => {
    setLocalBrightness((prev) => ({ ...prev, [lightId]: newValue }));
  };

  const handleBrightnessChangeCommitted = async (lightId, newValue) => {
  const now = new Date();
  try {
    await apiCall(lightId, "BRIGHTNESS", { value: newValue });

    setLightStates((prev) => ({
      ...prev,
      [lightId]: {
        ...prev[lightId],
        brightness: newValue,
        manualOverride: true,
        lastManualAction: now.toISOString(),
      },
    }));
  } catch (err) {
    setError(err.message);
  }
};


  const handleAddLight = async () => {
  if (!newLightId.trim()) {
    setError("Vui lòng nhập tên cho bóng đèn!");
    return;
  }

  try {
    let token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}/device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newLightId, location: "Phòng khách" }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi API");

    const device = data.device;
    setLightStates((prev) => ({
      ...prev,
      [device._id]: {
        isOn: false,
        brightness: 50,
        manualOverride: false,
      },
    }));

    setNewLightId("");
    setError("");
  } catch (err) {
    setError(err.message);
  }
};


  const handleDeleteLight = (lightId) => {
    if (window.confirm(`Bạn có chắc muốn xóa bóng đèn ${lightId}?`)) {
      const now = new Date();
      setLightStates((prev) => {
        const newStates = { ...prev };
        delete newStates[lightId];
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
          <Button variant="contained" color="success" onClick={handleAddLight} sx={{ height: "40px" }}>
            Thêm bóng đèn
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: "10px" }}>
            {error}
          </Alert>
        )}
      </Box>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="180px" gap="20px">
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
              <Button variant="contained" color="error" onClick={() => handleDeleteLight(lightId)}>
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
};


export default LightControl;
