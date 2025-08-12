import { Box, Select, MenuItem, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import { useState } from "react";

const Bar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [dataType, setDataType] = useState("isOn");

  return (
    <Box m="20px">
      <Header title="Biểu đồ trạng thái đèn" subtitle="Biểu đồ cột hiển thị trạng thái, độ sáng hoặc công suất" />
      <Box display="flex" justifyContent="flex-end" mb="10px">
        <Select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          sx={{ color: colors.grey[100] }}
        >
          <MenuItem value="isOn">Trạng thái (Bật/Tắt)</MenuItem>
          <MenuItem value="brightness">Độ sáng</MenuItem>
          <MenuItem value="power">Công suất</MenuItem>
        </Select>
      </Box>
      <Box height="75vh">
        <BarChart isDashboard={false} dataType={dataType} />
      </Box>
    </Box>
  );
};

export default Bar;