import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getMyApplications } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function statusColor(status) {
  if (status === "accepted") return colors.success;
  if (status === "rejected") return colors.danger;
  return colors.warning;
}

export default function MyApplicationsScreen({ navigation }) {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = user?.userId || "";

  const applications = useMemo(() => {
    return jobs
      .map((job) => {
        const app = (job.applications || []).find((item) => normalizeId(item.worker) === userId);
        if (!app) return null;
        return { job, app };
      })
      .filter(Boolean);
  }, [jobs, userId]);

  const counters = useMemo(() => {
    const result = { all: applications.length, pending: 0, accepted: 0, rejected: 0 };
    applications.forEach(({ app }) => {
      if (app.status === "accepted") result.accepted += 1;
      else if (app.status === "rejected") result.rejected += 1;
      else result.pending += 1;
    });
    return result;
  }, [applications]);

  const loadData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const list = await getMyApplications(token);
      setJobs(list);
    } catch (e) {
      setError(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={({ job }, index) => normalizeId(job) || `application-${index}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
            <Text style={styles.title}>My Applications</Text>
            <Text style={styles.subtitle}>Track pending, accepted, and rejected job applications.</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{counters.all}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: colors.warning }]}>{counters.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: colors.success }]}>{counters.accepted}</Text>
                <Text style={styles.statLabel}>Accepted</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: colors.danger }]}>{counters.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>

            <Pressable style={styles.refreshBtn} onPress={loadData}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>

            {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No applications yet.</Text> : null}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("JobDetail", { jobId: normalizeId(item.job), job: item.job })}
          >
            <Text style={styles.jobTitle}>{item.job.jobTitle}</Text>
            <Text style={styles.meta}>
              {item.job.category} | {item.job.city}, {item.job.district}
            </Text>
            <Text style={styles.meta}>
              Budget: LKR {item.job.budgetMin || 0} - {item.job.budgetMax || 0}
            </Text>
            <Text style={[styles.status, { color: statusColor(item.app.status) }]}>
              {item.app.status || "pending"}
            </Text>
            <Text style={styles.meta}>My Rate: LKR {item.app.proposedRate || 0}/hr</Text>
          </Pressable>
        )}
      />
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
    paddingBottom: 24,
    gap: 9,
  },
  back: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  statNum: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  refreshBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: {
    color: colors.text,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    gap: 4,
  },
  jobTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
  },
  status: {
    fontWeight: "800",
    textTransform: "capitalize",
    marginTop: 2,
  },
  helper: {
    color: colors.textMuted,
    marginTop: 10,
  },
  error: {
    color: colors.danger,
    marginTop: 10,
  },
});
