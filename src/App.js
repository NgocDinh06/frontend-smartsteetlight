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

function App() {
  const [theme, colorMode] = useMode();

  const [lightStates, setLightStates] = useState(() => {
    const savedStates = localStorage.getItem("lightStates");
    if (savedStates) {
      try {
        const parsedStates = JSON.parse(savedStates);
        if (parsedStates && typeof parsedStates === "object" && !Array.isArray(parsedStates)) {
          return parsedStates;
        } else {
          console.warn("Invalid lightStates format in localStorage, using default.");
          return {
            
          };
        }
      } catch (e) {
        console.error("Error parsing lightStates from localStorage:", e);
        return {
          
        };
      }
    }
    return {
    };
  });

  const [currentEvents, setCurrentEvents] = useState(() => {
    const savedEvents = localStorage.getItem("currentEvents");
    if (savedEvents && typeof savedEvents === "string" && savedEvents.trim() !== "") {
      try {
        return JSON.parse(savedEvents);
      } catch (e) {
        console.error("Error parsing currentEvents from localStorage:", e);
        return [];
      }
    }
    return [];
  });

  const [completedEvents, setCompletedEvents] = useState(() => {
    const savedCompleted = localStorage.getItem("completedEvents");
    if (savedCompleted && typeof savedCompleted === "string" && savedCompleted.trim() !== "") {
      try {
        return JSON.parse(savedCompleted);
      } catch (e) {
        console.error("Error parsing completedEvents from localStorage:", e);
        return [];
      }
    }
    return [];
  });

  const [lightHistory, setLightHistory] = useState(() => {
    const savedHistory = localStorage.getItem("lightHistory");
    if (savedHistory && typeof savedHistory === "string" && savedHistory.trim() !== "") {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Error parsing lightHistory from localStorage:", e);
        return [];
      }
    }
    return [];
  });

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
      const eventEnd = event.end ? new Date(event.end) : (event.extendedProps.action === "off" ? new Date(4102444800000) : eventStart);
      return now >= eventStart && now < eventEnd;
    });

    // Đặt trạng thái đèn dựa trên manualOverride, lastManualAction, lastOffEvent và activeEvents
    Object.keys(updatedLightStates).forEach((lightId) => {
      // Ưu tiên manualOverride nếu có thao tác thủ công trong vòng 5 giây
      if (updatedLightStates[lightId].manualOverride && updatedLightStates[lightId].lastManualAction) {
        const lastManualActionTime = new Date(updatedLightStates[lightId].lastManualAction);
        if (now - lastManualActionTime < 5000) { // Grace period 5 giây
          return;
        }
      }
      if (!activeEvents.some((event) => event.extendedProps.lightId === lightId)) {
        // Nếu không có sự kiện lịch, sử dụng lastOffEvent để xác định trạng thái
        updatedLightStates[lightId].isOn = updatedLightStates[lightId].lastOffEvent && !updatedLightStates[lightId].manualOverride ? false : updatedLightStates[lightId].isOn;
        if (!updatedLightStates[lightId].manualOverride) {
          updatedLightStates[lightId].isOn = false; // Mặc định tắt nếu không có manualOverride
        }
      }
    });

    // Cập nhật trạng thái đèn dựa trên các sự kiện đang hoạt động
    activeEvents.forEach((event) => {
      const lightId = event.extendedProps.lightId;
      if (!updatedLightStates[lightId]) {
        updatedLightStates[lightId] = { isOn: false, power: 100, brightness: 50, manualOverride: false, lastOffEvent: null, lastManualAction: null };
      }
      // Chỉ áp dụng sự kiện lịch nếu không có manualOverride gần đây
      if (!updatedLightStates[lightId].manualOverride || (updatedLightStates[lightId].lastManualAction && now - new Date(updatedLightStates[lightId].lastManualAction) >= 5000)) {
        updatedLightStates[lightId].isOn = event.extendedProps.action === "on" ? true : false;
        updatedLightStates[lightId].manualOverride = false;
        if (event.extendedProps.action === "off") {
          updatedLightStates[lightId].lastOffEvent = event.start;
        } else {
          updatedLightStates[lightId].lastOffEvent = null; // Xóa lastOffEvent khi có sự kiện "Bật"
        }
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