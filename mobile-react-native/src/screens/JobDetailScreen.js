import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { applyToJob, createBooking, deleteJob, getJob } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function applicationStatusColor(status) {
  if (status === "accepted") return colors.success;
  if (status === "rejected") return colors.danger;
  return colors.warning;
}

export default function JobDetailScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const routeJob = route.params?.job || null;
  const jobId = normalizeId(route.params?.jobId || route.params?.id || routeJob);

  const [job, setJob] = useState(routeJob);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [proposedRate, setProposedRate] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applyBusy, setApplyBusy] = useState(false);
  const [bookingBusyWorkerId, setBookingBusyWorkerId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const userId = user?.userId || "";
  const role = user?.role || "customer";

  const loadJob = useCallback(async () => {
    if (!jobId) {
      setLoading(false);
      setError("Unable to open job: missing job ID");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getJob(token, jobId);
      setJob(data);
    } catch (e) {
      const fetchError = e.message || "Failed to load job";
      if (routeJob) {
        setMessage("Showing cached job details while live refresh is unavailable.");
      } else {
        setError(fetchError);
      }
    } finally {
      setLoading(false);
    }
  }, [token, jobId, routeJob]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const customerId = normalizeId(job?.customer);
  const isOwner = customerId && customerId === userId;

  const myApplication = useMemo(() => {
    const applications = job?.applications || [];
    return applications.find((application) => {
      const workerId = normalizeId(application.worker);
      return workerId === userId;
    });
  }, [job?.applications, userId]);

  const canApply = role === "worker" && job?.jobStatus === "active" && !myApplication;

  async function handleApply() {
    if (!proposedRate || Number(proposedRate) <= 0) {
      setMessage("Enter a valid proposed rate");
      return;
    }
    if (coverLetter.trim().length < 30) {
      setMessage("Cover letter must be at least 30 characters");
      return;
    }

    try {
      setApplyBusy(true);
      setMessage("");
      await applyToJob(token, jobId, {
        proposedRate,
        coverLetter: coverLetter.trim(),
      });
      setMessage("Application submitted successfully");
      setCoverLetter("");
      await loadJob();
    } catch (e) {
      setMessage(e.message || "Failed to submit application");
    } finally {
      setApplyBusy(false);
    }
  }

  async function handleCreateBooking(application) {
    const workerId = normalizeId(application.worker);
    if (!workerId) return;

    try {
      setBookingBusyWorkerId(workerId);
      setMessage("");
      await createBooking(token, {
        job: jobId,
        worker: workerId,
        scheduledDate: job?.preferredStartDate || new Date().toISOString(),
        scheduledTime: "09:00",
        estimatedDurationHours: Number(job?.estimatedDurationHours || 2),
        notes: `Created from job application: ${job?.jobTitle || "Job"}`,
      });
      setMessage("Booking created. You can manage it from Bookings.");
    } catch (e) {
      setMessage(e.message || "Failed to create booking");
    } finally {
      setBookingBusyWorkerId("");
    }
  }

  function confirmDelete() {
    Alert.alert("Delete Job", "This will permanently remove the job post.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteJob(token, jobId);
            navigation.goBack();
          } catch (e) {
            setMessage(e.message || "Failed to delete job");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          {isOwner ? (
            <Pressable onPress={confirmDelete} disabled={deleting}>
              <Text style={styles.delete}>{deleting ? "Deleting..." : "Delete Job"}</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {error && !job ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.helper}>{message}</Text> : null}

        {job ? (
          <>
            <View style={styles.card}>
              <Text style={styles.title}>{job.jobTitle}</Text>
              <Text style={styles.meta}>
                {job.category} | {job.city}, {job.district}
              </Text>
              <Text style={styles.meta}>Status: {job.jobStatus}</Text>
              <Text style={styles.meta}>Urgency: {job.urgencyLevel || "standard"}</Text>
              <Text style={styles.meta}>
                Budget: LKR {job.budgetMin || 0} - {job.budgetMax || 0}
              </Text>
              <Text style={styles.meta}>Duration: {job.estimatedDurationHours || "-"} hours</Text>
              <Text style={styles.meta}>Start: {formatDate(job.preferredStartDate)}</Text>
              <Text style={styles.body}>{job.jobDescription}</Text>
            </View>

            {myApplication ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Application</Text>
                <Text style={[styles.meta, { color: applicationStatusColor(myApplication.status) }]}>
                  Status: {myApplication.status || "pending"}
                </Text>
                <Text style={styles.meta}>Rate: LKR {myApplication.proposedRate || "-"}/hr</Text>
                {myApplication.coverLetter ? (
                  <Text style={styles.body}>{myApplication.coverLetter}</Text>
                ) : null}
              </View>
            ) : null}

            {canApply ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Apply for this Job</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Proposed rate (LKR/hr)"
                  placeholderTextColor={colors.textMuted}
                  value={proposedRate}
                  onChangeText={setProposedRate}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder="Cover letter (minimum 30 characters)"
                  placeholderTextColor={colors.textMuted}
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                />
                <Pressable style={styles.primaryBtn} onPress={handleApply} disabled={applyBusy}>
                  <Text style={styles.primaryBtnText}>
                    {applyBusy ? "Submitting..." : "Submit Application"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {isOwner ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Applications ({job.applications?.length || 0})</Text>
                {job.applications?.length ? (
                  job.applications.map((application) => {
                    const worker = application.worker || {};
                    const workerId = normalizeId(worker);
                    const workerName = `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || "Worker";
                    const busy = bookingBusyWorkerId === workerId;
                    return (
                      <View key={`${workerId}-${application.appliedAt || ""}`} style={styles.applicationCard}>
                        <Text style={styles.workerName}>{workerName}</Text>
                        <Text style={styles.meta}>Rate: LKR {application.proposedRate || "-"}/hr</Text>
                        <Text style={[styles.meta, { color: applicationStatusColor(application.status) }]}>
                          Status: {application.status || "pending"}
                        </Text>
                        {application.coverLetter ? (
                          <Text style={styles.meta} numberOfLines={3}>
                            {application.coverLetter}
                          </Text>
                        ) : null}
                        <Pressable
                          style={styles.secondaryBtn}
                          onPress={() => handleCreateBooking(application)}
                          disabled={busy}
                        >
                          <Text style={styles.secondaryBtnText}>
                            {busy ? "Creating..." : "Create Booking"}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.meta}>No applications yet.</Text>
                )}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: layout.pagePadding,
    paddingBottom: 28,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  delete: {
    color: colors.danger,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 3,
  },
  meta: {
    color: colors.textMuted,
  },
  body: {
    color: colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  primaryBtn: {
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: colors.primary,
    fontWeight: "800",
  },
  applicationCard: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  workerName: {
    color: colors.text,
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  secondaryBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  helper: {
    color: colors.success,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
  },
});
