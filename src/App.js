import { useState, createContext, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/Login";
import LightControl from "./scenes/lightcontrol/LightControl";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./scenes/history/History";

const LightStateContext = createContext();

// 🛠️ Hàm parse JSON an toàn
const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    // Nếu là "null" hoặc "undefined" dạng string thì bỏ
    if (raw === "null" || raw === "undefined") {
      localStorage.removeItem(key);
      return fallback;
    }

    const parsed = JSON.parse(raw);

    // Chặn trường hợp không đúng type mong đợi
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === "object" && !Array.isArray(fallback) && typeof parsed !== "object") return fallback;

    return parsed;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    localStorage.removeItem(key); // xoá dữ liệu hỏng để tránh lỗi lặp lại
    return fallback;
  }
};

function App() {
  const [theme, colorMode] = useMode();

  const [lightStates, setLightStates] = useState(() => {
    const parsed = safeParse("lightStates", {});
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  });

  const [currentEvents, setCurrentEvents] = useState(() =>
    safeParse("currentEvents", [])
  );

  const [completedEvents, setCompletedEvents] = useState(() =>
    safeParse("completedEvents", [])
  );

  const [lightHistory, setLightHistory] = useState(() =>
    safeParse("lightHistory", [])
  );

  const updateLightStates = (newStates) => {
    setLightStates(newStates);
    localStorage.setItem("lightStates", JSON.stringify(newStates));
  };

  const updateCurrentEvents = (newEvents) => {
    setCurrentEvents(newEvents);
    localStorage.setItem("currentEvents", JSON.stringify(newEvents));
  };

  const updateCompletedEvents = (newEvents) => {
    setCompletedEvents(newEvents);
    localStorage.setItem("completedEvents", JSON.stringify(newEvents));
  };

  const updateLightHistory = (newHistory) => {
    setLightHistory(newHistory);
    localStorage.setItem("lightHistory", JSON.stringify(newHistory));
  };

  const syncLightStatesWithSchedule = (now) => {
    const updatedLightStates = { ...lightStates };
    const activeEvents = currentEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end
        ? new Date(event.end)
        : event.extendedProps.action === "off"
        ? new Date(4102444800000) // 2099-01-01
        : eventStart;
      return now >= eventStart && now < eventEnd;
    });

    Object.keys(updatedLightStates).forEach((lightId) => {
      if (
        updatedLightStates[lightId].manualOverride &&
        updatedLightStates[lightId].lastManualAction
      ) {
        const lastManualActionTime = new Date(
          updatedLightStates[lightId].lastManualAction
        );
        if (now - lastManualActionTime < 5000) {
          return; // bỏ qua, người dùng vừa bấm tay
        }
      }
      if (
        !activeEvents.some((event) => event.extendedProps.lightId === lightId)
      ) {
        if (!updatedLightStates[lightId].manualOverride) {
          updatedLightStates[lightId].isOn = false;
        }
      }
    });

    activeEvents.forEach((event) => {
      const lightId = event.extendedProps.lightId;
      if (!updatedLightStates[lightId]) {
        updatedLightStates[lightId] = {
          isOn: false,
          power: 100,
          brightness: 50,
          manualOverride: false,
          lastOffEvent: null,
          lastManualAction: null,
        };
      }
      if (
        !updatedLightStates[lightId].manualOverride ||
        (updatedLightStates[lightId].lastManualAction &&
          now - new Date(updatedLightStates[lightId].lastManualAction) >= 5000)
      ) {
        updatedLightStates[lightId].isOn =
          event.extendedProps.action === "on";
        updatedLightStates[lightId].manualOverride = false;
        updatedLightStates[lightId].lastOffEvent =
          event.extendedProps.action === "off" ? event.start : null;
      }
    });

    setLightStates(updatedLightStates);
    localStorage.setItem("lightStates", JSON.stringify(updatedLightStates));
    return activeEvents;
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LightStateContext.Provider
          value={{
            lightStates,
            setLightStates: updateLightStates,
            currentEvents,
            setCurrentEvents: updateCurrentEvents,
            completedEvents,
            setCompletedEvents: updateCompletedEvents,
            lightHistory,
            setLightHistory: updateLightHistory,
            syncLightStatesWithSchedule,
          }}
        >
          <div style={{ display: "flex" }}>
            <Sidebar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Team />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Contacts />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Form />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bar"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Bar />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pie"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Pie />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/line"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Line />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Calendar />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/geography"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <Geography />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/light-control"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <LightControl />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <div className="app">
                      <main className="content">
                        <Topbar />
                        <History />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </LightStateContext.Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useLightState = () => useContext(LightStateContext);

export default App;
