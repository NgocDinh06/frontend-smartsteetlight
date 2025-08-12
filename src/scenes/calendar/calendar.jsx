import { useState, useEffect, useRef } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  Typography,
  useTheme,
  Select,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useLightState } from "../../App";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { lightStates, currentEvents, setCurrentEvents, completedEvents, setCompletedEvents, lightHistory, setLightHistory, setLightStates, syncLightStatesWithSchedule } = useLightState();
  const [selectedLight, setSelectedLight] = useState(Object.keys(lightStates)[0] || "");
  const [action, setAction] = useState("on");
  const [openDialog, setOpenDialog] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      const activeEvents = syncLightStatesWithSchedule(now);

      // Xử lý sự kiện "Tắt": xóa khỏi currentEvents và lưu vào completedEvents/lightHistory
      const offEventsToRemove = currentEvents.filter((event) => {
        const eventStart = new Date(event.start);
        return event.extendedProps.action === "off" && now >= eventStart;
      });

      if (offEventsToRemove.length > 0) {
        setCompletedEvents((prev) => [...prev, ...offEventsToRemove]);
        offEventsToRemove.forEach((event) => {
          const eventStart = new Date(event.start);
          setLightHistory((prev) => [
            ...prev,
            {
              lightId: event.extendedProps.lightId,
              action: event.extendedProps.action,
              start: eventStart,
              end: eventStart, // Sự kiện "Tắt" là tức thời
              duration: 0,
              timestamp: now,
            },
          ]);
        });
        setCurrentEvents((prev) => prev.filter((event) => !offEventsToRemove.some((c) => c.id === event.id)));
      }

      // Xử lý sự kiện "Bật": chuyển sang completedEvents khi hoàn thành
      const completed = currentEvents.filter((event) => {
        const eventEnd = event.end ? new Date(event.end) : null;
        return event.extendedProps.action === "on" && eventEnd && now >= eventEnd;
      });

      if (completed.length > 0) {
        setCompletedEvents((prev) => [...prev, ...completed]);
        completed.forEach((event) => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          const duration = (eventEnd - eventStart) / (1000 * 60); // Tính bằng phút
          setLightHistory((prev) => [
            ...prev,
            {
              lightId: event.extendedProps.lightId,
              action: event.extendedProps.action,
              start: eventStart,
              end: eventEnd,
              duration: duration,
              timestamp: now,
            },
          ]);
        });
        setCurrentEvents((prev) => prev.filter((event) => !completed.some((c) => c.id === event.id)));
      }

      // Cập nhật trạng thái đèn sau khi xóa hoặc hoàn thành sự kiện
      syncLightStatesWithSchedule(now);

      // Cập nhật FullCalendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.removeAllEvents();
        currentEvents.forEach((event) => calendarApi.addEvent(event));
      }

      console.log("Calendar - Current Events:", currentEvents, "Light States:", lightStates); // Debug
    }, 1000);
    return () => clearInterval(interval);
  }, [currentEvents, setCurrentEvents, setCompletedEvents, setLightHistory, lightStates, setLightStates, syncLightStatesWithSchedule]);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setOpenDialog(true);
  };

  const handleConfirmEvent = () => {
    if (!selectedLight || !startTime || !selectedDate) {
      alert("Vui lòng chọn bóng đèn và thời gian bắt đầu!");
      return;
    }

    const startDateTime = new Date(selectedDate.startStr);
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    if (isNaN(startHours) || isNaN(startMinutes) || startHours > 23 || startMinutes > 59) {
      alert("Thời gian bắt đầu không hợp lệ! Vui lòng dùng định dạng HH:MM (00:00-23:59).");
      return;
    }
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    let endDateTime = null;
    if (action === "on") {
      if (!endTime) {
        alert("Vui lòng chọn thời gian kết thúc khi đặt bật đèn!");
        return;
      }
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      if (isNaN(endHours) || isNaN(endMinutes) || endHours > 23 || endMinutes > 59) {
        alert("Thời gian kết thúc không hợp lệ! Vui lòng dùng định dạng HH:MM (00:00-23:59).");
        return;
      }
      endDateTime = new Date(selectedDate.startStr);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      if (endDateTime <= startDateTime) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
      }
    }

    const newEvent = {
      id: `${Date.now()}-${selectedLight}-${action}`,
      title: `${selectedLight} - ${action === "on" ? "Bật" : "Tắt"}`,
      start: startDateTime,
      end: action === "on" ? endDateTime : null, // Sự kiện "Tắt" không có end
      allDay: false,
      extendedProps: {
        lightId: selectedLight,
        action: action,
      },
    };

    try {
      setCurrentEvents((prev) => [...prev, newEvent]);
      // Cập nhật trạng thái đèn ngay lập tức nếu sự kiện đang hoạt động
      const now = new Date();
      if (now >= startDateTime && (action === "off" || (action === "on" && now < endDateTime))) {
        setLightStates((prev) => ({
          ...prev,
          [selectedLight]: {
            ...prev[selectedLight],
            isOn: action === "on" ? true : false,
            manualOverride: false,
            lastOffEvent: action === "off" ? startDateTime.toISOString() : null,
          },
        }));
      }
      // Gọi syncLightStatesWithSchedule để đồng bộ các đèn khác
      syncLightStatesWithSchedule(now);
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện:", error);
      alert("Có lỗi khi thêm sự kiện. Vui lòng thử lại!");
    }

    setSelectedLight(Object.keys(lightStates)[0] || "");
    setAction("on");
    setStartTime("");
    setEndTime("");
    setSelectedDate(null);
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLight(Object.keys(lightStates)[0] || "");
    setAction("on");
    setStartTime("");
    setEndTime("");
    setSelectedDate(null);
  };

  const handleEventClick = (selected) => {
    if (window.confirm(`Bạn có chắc muốn xóa sự kiện '${selected.event.title}'?`)) {
      selected.event.remove();
      setCurrentEvents((prev) => prev.filter((event) => event.id !== selected.event.id));
      // Cập nhật trạng thái đèn sau khi xóa sự kiện
      syncLightStatesWithSchedule(new Date());
    }
  };

  return (
    <Box m="20px">
      <Header title="Lịch hẹn giờ" subtitle="Lập lịch bật/tắt bóng đèn" />
      <Typography
        variant="body2"
        color={colors.grey[300]}
        sx={{ mb: "20px", textAlign: "center" }}
      >
        Thời gian hiện tại: {formatDate(currentDateTime, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })} (+07)
      </Typography>

      <Box>
        <FullCalendar
          ref={calendarRef}
          height="75vh"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={currentEvents}
          eventDidMount={(info) => {
            const now = new Date();
            const eventEnd = info.event.end ? new Date(info.event.end) : (info.event.extendedProps.action === "off" ? new Date(4102444800000) : new Date(info.event.start));
            if (now >= eventEnd) {
              info.el.style.backgroundColor = colors.redAccent[500];
              info.el.style.borderColor = colors.redAccent[500];
            } else {
              info.el.style.backgroundColor = info.event.extendedProps.action === "on" ? colors.greenAccent[500] : colors.redAccent[500];
              info.el.style.borderColor = info.event.extendedProps.action === "on" ? colors.greenAccent[600] : colors.redAccent[600];
            }
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: colors.grey[100], backgroundColor: colors.primary[400] }}>
          Thêm lịch hẹn giờ
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Select
            value={selectedLight}
            onChange={(e) => setSelectedLight(e.target.value)}
            fullWidth
            sx={{ mb: "10px", color: colors.grey[100] }}
          >
            {Object.keys(lightStates).map((light) => (
              <MenuItem key={light} value={light}>
                {light}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setEndTime(""); // Reset endTime khi đổi action
            }}
            fullWidth
            sx={{ mb: "10px", color: colors.grey[100] }}
          >
            <MenuItem value="on">Bật</MenuItem>
            <MenuItem value="off">Tắt</MenuItem>
          </Select>
          <TextField
            label="Thời gian bắt đầu (HH:MM)"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            sx={{ mb: "10px", input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }}
            required
          />
          {action === "on" && (
            <TextField
              label="Thời gian kết thúc (HH:MM)"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              sx={{ input: { color: colors.grey[100] }, label: { color: colors.grey[300] } }}
              required
            />
          )}
          {action === "on" && endTime && (
            <Alert severity="info" sx={{ mt: "10px" }}>
              Lưu ý: Đèn sẽ tự động tắt khi đến thời gian kết thúc.
            </Alert>
          )}
          {action === "off" && (
            <Alert severity="info" sx={{ mt: "10px" }}>
              Lưu ý: Đèn sẽ được tắt vĩnh viễn từ thời gian bắt đầu và sự kiện sẽ tự động xóa khỏi lịch. Có thể bật lại đèn qua LightControl.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: "10px" }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleConfirmEvent} color="success" disabled={!selectedLight || !startTime || (action === "on" && !endTime)}>
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;