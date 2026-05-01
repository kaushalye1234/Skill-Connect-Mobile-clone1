import { useCallback, useEffect, useState } from "react";
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
  createComplaint,
  deleteComplaint,
  getComplaints,
  getMyBookings,
  getWorkers,
  updateComplaintStatus,
} from "../services/apiClient";

const CATEGORIES = [
  "service_quality",
  "inappropriate_behavior",
  "fraud",
  "payment_issue",
  "other",
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function ComplaintsScreen() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    complainedAgainst: "",
    booking: "",
    complaintCategory: "service_quality",
    complaintTitle: "",
    complaintDescription: "",
    priority: "medium",
  });

  const adminMode = user?.role === "admin";

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [complaintsData, workersData, bookingsData] = await Promise.all([
        getComplaints(token, adminMode),
        getWorkers(token),
        getMyBookings(token, "customer"),
      ]);
      setComplaints(complaintsData);
      setWorkers(workersData);
      setBookings(bookingsData);
    } catch (e) {
      setError(e.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [token, adminMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function useBookingForComplaint(booking) {
    const revieweeId = booking?.worker?._id || booking?.worker;
    if (revieweeId) {
      updateForm("complainedAgainst", revieweeId);
    }
    updateForm("booking", booking._id);
  }

  async function submitComplaint() {
    if (!form.complainedAgainst || !form.complaintTitle || !form.complaintDescription) {
      setActionError("Complained user, title and description are required");
      return;
    }

    try {
      setActionError("");
      setSubmitting(true);
      await createComplaint(token, form);
      setForm({
        complainedAgainst: "",
        booking: "",
        complaintCategory: "service_quality",
        complaintTitle: "",
        complaintDescription: "",
        priority: "medium",
      });
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to create complaint");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(complaintId) {
    try {
      setActionError("");
      await deleteComplaint(token, complaintId);
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to delete complaint");
    }
  }

  async function handleStatusChange(complaintId, status) {
    try {
      setActionError("");
      await updateComplaintStatus(token, complaintId, status, "Updated from React Native app");
      await loadData();
    } catch (e) {
      setActionError(e.message || "Failed to update complaint status");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScrollView style={styles.headerWrap}>
            <View style={styles.topRow}>
              <Text style={styles.title}>Complaints</Text>
              <Pressable style={styles.refreshBtn} onPress={loadData}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Complaint</Text>

              <Text style={styles.label}>Complained User ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Worker/User ID"
                value={form.complainedAgainst}
                onChangeText={(value) => updateForm("complainedAgainst", value)}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                {workers.slice(0, 12).map((worker) => {
                  const workerName = `${worker.firstName || ""} ${worker.lastName || ""}`.trim();
                  return (
                    <Pressable
                      key={worker._id}
                      style={[styles.pill, form.complainedAgainst === worker._id && styles.pillActive]}
                      onPress={() => updateForm("complainedAgainst", worker._id)}
                    >
                      <Text style={[styles.pillText, form.complainedAgainst === worker._id && styles.pillTextActive]}>
                        {workerName || worker._id.slice(-6)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>Link Booking (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Booking ID"
                value={form.booking}
                onChangeText={(value) => updateForm("booking", value)}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                {bookings.slice(0, 12).map((booking) => (
                  <Pressable
                    key={booking._id}
                    style={[styles.pill, form.booking === booking._id && styles.pillActive]}
                    onPress={() => useBookingForComplaint(booking)}
                  >
                    <Text style={[styles.pillText, form.booking === booking._id && styles.pillTextActive]}>
                      {booking.job?.jobTitle || booking._id.slice(-6)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.label}>Category</Text>
              <View style={styles.optionWrap}>
                {CATEGORIES.map((category) => (
                  <Pressable
                    key={category}
                    style={[styles.option, form.complaintCategory === category && styles.optionActive]}
                    onPress={() => updateForm("complaintCategory", category)}
                  >
                    <Text style={[styles.optionText, form.complaintCategory === category && styles.optionTextActive]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Priority</Text>
              <View style={styles.optionWrap}>
                {PRIORITIES.map((priority) => (
                  <Pressable
                    key={priority}
                    style={[styles.option, form.priority === priority && styles.optionActive]}
                    onPress={() => updateForm("priority", priority)}
                  >
                    <Text style={[styles.optionText, form.priority === priority && styles.optionTextActive]}>
                      {priority}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Complaint title"
                value={form.complaintTitle}
                onChangeText={(value) => updateForm("complaintTitle", value)}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue"
                value={form.complaintDescription}
                onChangeText={(value) => updateForm("complaintDescription", value)}
                multiline
              />

              <Pressable style={styles.primaryBtn} onPress={submitComplaint} disabled={submitting}>
                <Text style={styles.primaryBtnText}>{submitting ? "Submitting..." : "Submit Complaint"}</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            {loading ? <Text style={styles.helper}>Loading complaints...</Text> : null}
          </ScrollView>
        }
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No complaints found.</Text> : null}
        renderItem={({ item }) => {
          const mine = !adminMode && (item.complainant?._id || item.complainant) === user?.userId;
          return (
            <View style={styles.card}>
              <Text style={styles.itemTitle}>{item.complaintTitle || "Complaint"}</Text>
              <Text style={styles.meta}>Category: {item.complaintCategory || "-"}</Text>
              <Text style={styles.meta}>Priority: {item.priority || "-"}</Text>
              <Text style={styles.meta}>Status: {item.complaintStatus || "-"}</Text>
              <Text style={styles.meta} numberOfLines={3}>
                {item.complaintDescription || "-"}
              </Text>

              <View style={styles.actionRow}>
                {mine ? (
                  <Pressable style={[styles.smallBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </Pressable>
                ) : null}

                {adminMode ? (
                  <>
                    <Pressable style={styles.smallBtn} onPress={() => handleStatusChange(item._id, "resolved")}>
                      <Text style={styles.smallBtnText}>Resolve</Text>
                    </Pressable>
                    <Pressable style={styles.smallBtn} onPress={() => handleStatusChange(item._id, "rejected")}>
                      <Text style={styles.smallBtnText}>Reject</Text>
                    </Pressable>
                  </>
                ) : null}
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
    backgroundColor: "#f8fafc",
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  refreshBtn: {
    marginLeft: "auto",
    backgroundColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
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
    borderColor: "#cbd5e1",
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  pillText: {
    color: "#1f2937",
    fontSize: 12,
  },
  pillTextActive: {
    color: "#fff",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  optionActive: {
    backgroundColor: "#1d4ed8",
  },
  optionText: {
    color: "#1f2937",
    fontSize: 12,
  },
  optionTextActive: {
    color: "#fff",
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  smallBtn: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
  },
  smallBtnText: {
    color: "#1e3a8a",
    fontWeight: "600",
    fontSize: 12,
  },
  meta: {
    color: "#334155",
    marginBottom: 4,
  },
  helper: {
    color: "#475569",
    marginBottom: 10,
  },
  error: {
    color: "#dc2626",
    marginBottom: 10,
  },
});
