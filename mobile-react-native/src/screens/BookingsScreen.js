import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  createBooking,
  deleteBooking,
  getMyBookings,
  getMyJobs,
  getWorkers,
  updateBookingStatus,
} from "../services/apiClient";
import { colors, layout } from "../styles/theme";

const STATUS_ACTIONS_BY_VIEW = {
  customer: {
    requested: ["cancelled"],
    accepted: ["cancelled"],
    in_progress: [],
    completed: [],
    cancelled: [],
    rejected: [],
  },
  worker: {
    requested: ["accepted", "rejected"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
    rejected: [],
  },
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function isValidObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || "").trim());
}

function normalizeTimeInput(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildScheduledDateTime(dateValue, timeValue) {
  const dateMatch = String(dateValue || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const normalizedTime = normalizeTimeInput(timeValue);
  if (!dateMatch || !normalizedTime) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const [hour, minute] = normalizedTime.split(":").map(Number);

  const localDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
  const validDate =
    localDateTime.getFullYear() === year &&
    localDateTime.getMonth() === month - 1 &&
    localDateTime.getDate() === day;

  if (!validDate) return null;

  return {
    localDateTime,
    isoDateTime: localDateTime.toISOString(),
    normalizedTime,
  };
}

export default function BookingsScreen() {
  const { token, user } = useAuth();
  const [roleView, setRoleView] = useState(user?.role === "worker" ? "worker" : "customer");
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [form, setForm] = useState({
    worker: "",
    job: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    estimatedDurationHours: "2",
    notes: "",
  });
  const [createBusy, setCreateBusy] = useState(false);

  const customerMode = user?.role !== "worker";

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [bookingsData, workersData, jobsData] = await Promise.all([
        getMyBookings(token, roleView),
        getWorkers(token),
        customerMode ? getMyJobs(token) : Promise.resolve([]),
      ]);
      setBookings(bookingsData);
      setWorkers(workersData);
      setJobs(jobsData);
    } catch (e) {
      setError(e.message || "Failed to load bookings data");
    } finally {
      setLoading(false);
    }
  }, [token, roleView, customerMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const workerNameMap = useMemo(() => {
    const map = new Map();
    for (const worker of workers) {
      map.set(worker._id, `${worker.firstName || ""} ${worker.lastName || ""}`.trim());
    }
    return map;
  }, [workers]);

  const selectedWorker = useMemo(
    () => workers.find((worker) => worker._id === form.worker) || null,
    [workers, form.worker]
  );

  const selectedJob = useMemo(
    () => jobs.find((job) => job._id === form.job) || null,
    [jobs, form.job]
  );

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitBooking() {
    if (!customerMode) {
      setActionError("Only customer accounts can create bookings.");
      return;
    }

    const workerId = String(form.worker || "").trim();
    const jobId = String(form.job || "").trim();
    const dateTime = buildScheduledDateTime(form.scheduledDate, form.scheduledTime);
    const durationHours = Number(form.estimatedDurationHours);

    if (!workerId) {
      setActionError("Please choose a worker.");
      return;
    }
    if (!isValidObjectId(workerId)) {
      setActionError("Selected worker is invalid. Please choose from the worker list.");
      return;
    }
    if (jobId && !isValidObjectId(jobId)) {
      setActionError("Selected job is invalid. Please choose from your job list.");
      return;
    }
    if (!dateTime) {
      setActionError("Please enter date as YYYY-MM-DD and time as HH:MM.");
      return;
    }
    if (dateTime.localDateTime <= new Date()) {
      setActionError("Booking date and time must be in the future.");
      return;
    }
    if (!Number.isFinite(durationHours) || durationHours < 0.5 || durationHours > 24) {
      setActionError("Estimated duration must be between 0.5 and 24 hours.");
      return;
    }

    try {
      setActionError("");
      setCreateBusy(true);
      await createBooking(token, {
        worker: workerId,
        job: jobId || undefined,
        scheduledDate: dateTime.isoDateTime,
        scheduledTime: dateTime.normalizedTime,
        estimatedDurationHours: durationHours,
        notes: String(form.notes || "").trim(),
      });

      setForm({
        worker: "",
        job: "",
        scheduledDate: "",
        scheduledTime: "09:00",
        estimatedDurationHours: "2",
        notes: "",
      });
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to create booking");
    } finally {
      setCreateBusy(false);
    }
  }

  async function onStatusChange(bookingId, nextStatus) {
    try {
      setActionError("");
      await updateBookingStatus(token, bookingId, nextStatus);
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to update booking status");
    }
  }

  async function onDelete(bookingId) {
    try {
      setActionError("");
      await deleteBooking(token, bookingId);
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to delete booking");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <ScrollView style={styles.headerWrap}>
            <Text style={styles.title}>Bookings</Text>

            <View style={styles.segmentRow}>
              <Pressable
                style={[styles.segmentBtn, roleView === "customer" && styles.segmentBtnActive]}
                onPress={() => setRoleView("customer")}
              >
                <Text style={[styles.segmentText, roleView === "customer" && styles.segmentTextActive]}>
                  Customer Bookings
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, roleView === "worker" && styles.segmentBtnActive]}
                onPress={() => setRoleView("worker")}
              >
                <Text style={[styles.segmentText, roleView === "worker" && styles.segmentTextActive]}>
                  Worker Bookings
                </Text>
              </Pressable>
              <Pressable style={styles.refreshBtn} onPress={loadData}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>
              {roleView === "customer"
                ? "Showing bookings where you are the customer."
                : "Showing bookings where you are the worker."}
            </Text>

            {customerMode && roleView === "customer" ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create Booking</Text>

                <Text style={styles.label}>Worker</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a worker from the list below"
                  value={form.worker}
                  onChangeText={(value) => updateForm("worker", value)}
                />
                {selectedWorker ? (
                  <Text style={styles.helper}>
                    Selected worker: {`${selectedWorker.firstName || ""} ${selectedWorker.lastName || ""}`.trim()}
                  </Text>
                ) : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                  {workers.slice(0, 12).map((worker) => {
                    const workerName = `${worker.firstName || ""} ${worker.lastName || ""}`.trim();
                    return (
                      <Pressable
                        key={worker._id}
                        style={[styles.pill, form.worker === worker._id && styles.pillActive]}
                        onPress={() => updateForm("worker", worker._id)}
                      >
                        <Text style={[styles.pillText, form.worker === worker._id && styles.pillTextActive]}>
                          {workerName || worker._id.slice(-6)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.label}>Job (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a job from your list below"
                  value={form.job}
                  onChangeText={(value) => updateForm("job", value)}
                />
                {selectedJob ? <Text style={styles.helper}>Selected job: {selectedJob.jobTitle || "Untitled Job"}</Text> : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                  {jobs.slice(0, 12).map((job) => (
                    <Pressable
                      key={job._id}
                      style={[styles.pill, form.job === job._id && styles.pillActive]}
                      onPress={() => updateForm("job", job._id)}
                    >
                      <Text style={[styles.pillText, form.job === job._id && styles.pillTextActive]}>
                        {job.jobTitle || job._id.slice(-6)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Scheduled Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-05-10"
                  value={form.scheduledDate}
                  onChangeText={(value) => updateForm("scheduledDate", value)}
                />

                <Text style={styles.label}>Scheduled Time (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  value={form.scheduledTime}
                  onChangeText={(value) => updateForm("scheduledTime", value)}
                />

                <Text style={styles.label}>Estimated Duration Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="numeric"
                  value={form.estimatedDurationHours}
                  onChangeText={(value) => updateForm("estimatedDurationHours", value)}
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Booking notes"
                  multiline
                  value={form.notes}
                  onChangeText={(value) => updateForm("notes", value)}
                />

                <Pressable style={styles.primaryBtn} onPress={submitBooking} disabled={createBusy}>
                  <Text style={styles.primaryBtnText}>{createBusy ? "Creating..." : "Create Booking"}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.helper}>
                  Create Booking is available only in the Customer Bookings section.
                </Text>
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            {loading ? <Text style={styles.helper}>Loading bookings...</Text> : null}
          </ScrollView>
        }
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.helper}>
              {roleView === "customer" ? "No customer bookings found." : "No worker bookings found."}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const workerName = item.worker?.firstName
            ? `${item.worker.firstName} ${item.worker.lastName || ""}`.trim()
            : workerNameMap.get(item.worker?._id) || "Unknown";
          const customerName = item.customer?.firstName
            ? `${item.customer.firstName} ${item.customer.lastName || ""}`.trim()
            : "Unknown";
          const allowedActions = STATUS_ACTIONS_BY_VIEW[roleView]?.[item.bookingStatus] || [];

          return (
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{item.job?.jobTitle || "Booking"}</Text>
              <Text style={styles.meta}>Status: {item.bookingStatus}</Text>
              <Text style={styles.meta}>Date: {formatDate(item.scheduledDate)} {item.scheduledTime || ""}</Text>
              <Text style={styles.meta}>Worker: {workerName}</Text>
              <Text style={styles.meta}>Customer: {customerName}</Text>

              <View style={styles.actionRow}>
                {allowedActions.map((status) => (
                  <Pressable
                    key={status}
                    style={styles.smallBtn}
                    onPress={() => onStatusChange(item._id, status)}
                  >
                    <Text style={styles.smallBtnText}>{status}</Text>
                  </Pressable>
                ))}
                <Pressable style={[styles.smallBtn, styles.deleteBtn]} onPress={() => onDelete(item._id)}>
                  <Text style={styles.smallBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWrap: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.textMuted,
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  segmentText: {
    color: colors.text,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: colors.primary,
  },
  refreshBtn: {
    marginLeft: "auto",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: colors.text,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  meta: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pillRow: {
    marginTop: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.text,
    fontSize: 12,
  },
  pillTextActive: {
    color: colors.primary,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colors.primary,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    marginBottom: 10,
  },
  helper: {
    color: colors.textMuted,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  smallBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#6b1d1d",
  },
});
