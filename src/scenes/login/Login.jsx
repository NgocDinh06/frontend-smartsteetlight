import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
const API_BASE = "http://localhost:5000/api";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }
      const { accessToken } = data;
      if (!accessToken) {
        setError("Không nhận được token từ server");
        return;
      }
      localStorage.setItem("accesToken", accessToken);
      localStorage.setItem("isAuthenticated", "true");

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối tới server");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "#ffffff", // Nền trắng cố định
        fontFamily: '"Source Sans Pro", sans-serif',
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        p={4}
        sx={{
          backgroundColor: "#f5f5f5", // Màu nền thẻ xám nhạt cố định
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          width: { xs: "90%", sm: 400 },
          maxWidth: 400,
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        {/* Logo hoặc tiêu đề */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#1976d2" // Màu xanh cố định
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
          >
            Admin Dashboard
          </Typography>
        </Box>

        <Typography
          variant="h5"
          mb={3}
          textAlign="center"
          color="#000000" // Màu chữ đen cố định
          sx={{ fontWeight: 500 }}
        >
          Đăng Nhập
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#e0e0e0", // Viền xám nhạt cố định
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2", // Viền xanh khi hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2", // Viền xanh khi focus
                },
                "& input": {
                  color: "#000000", // Chữ nhập vào màu đen
                },
              },
              "& .MuiInputLabel-root": {
                color: "#000000", // Nhãn màu đen
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#000000", // Nhãn màu đen khi focus
              },
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#e0e0e0", // Viền xám nhạt cố định
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2", // Viền xanh khi hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2", // Viền xanh khi focus
                },
                "& input": {
                  color: "#000000", // Chữ nhập vào màu đen
                },
              },
              "& .MuiInputLabel-root": {
                color: "#000000", // Nhãn màu đen
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#000000", // Nhãn màu đen khi focus
              },
            }}
          />
          {error && (
            <Typography
              color="#d32f2f" // Màu đỏ lỗi cố định
              mt={2}
              textAlign="center"
              sx={{ fontSize: "0.9rem" }}
            >
              {error}
            </Typography>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: "8px",
              backgroundColor: "#1976d2", // Nút xanh cố định
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#1565c0", // Xanh đậm hơn khi hover
                transform: "scale(1.02)",
              },
            }}
          >
            Đăng Nhập
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;