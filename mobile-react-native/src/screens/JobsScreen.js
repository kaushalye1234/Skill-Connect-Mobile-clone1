import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getJobsWithFilters, getMyJobs } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

const CATEGORIES = [
  "all",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Masonry",
  "Welding",
  "Roofing",
  "Landscaping",
  "Cleaning",
  "Moving",
  "Other",
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export default function JobsScreen({ navigation }) {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState(user?.role === "customer" ? "mine" : "browse");

  const role = user?.role || "customer";

  const loadJobs = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      if (viewMode === "mine") {
        const mine = await getMyJobs(token);
        setJobs(mine);
        return;
      }

      const filters = { status: "active" };
      if (activeCategory !== "all") filters.category = activeCategory;
      if (district.trim()) filters.district = district.trim();

      const list = await getJobsWithFilters(token, filters);
      setJobs(list);
    } catch (e) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [token, viewMode, activeCategory, district]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.trim().toLowerCase();
    return jobs.filter((job) =>
      [job.jobTitle, job.jobDescription, job.category, job.city, job.district]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [jobs, search]);

  function onOpenJob(job) {
    const jobId = normalizeId(job);
    if (!jobId) {
      setError("Unable to open job: missing job ID");
      return;
    }
    navigation.navigate("JobDetail", { jobId, job });
  }

  const canPostJob = role === "customer" || role === "admin";

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredJobs}
        keyExtractor={(item, index) => normalizeId(item) || `job-${index}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Jobs</Text>
            <Text style={styles.subtitle}>Browse jobs, post requests, and track applications.</Text>

            <View style={styles.topActions}>
              <Pressable style={styles.btn} onPress={loadJobs}>
                <Text style={styles.btnText}>Refresh</Text>
              </Pressable>
              {role === "worker" ? (
                <Pressable style={styles.btn} onPress={() => navigation.navigate("MyApplications")}>
                  <Text style={styles.btnText}>My Applications</Text>
                </Pressable>
              ) : null}
              {canPostJob ? (
                <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("PostJob")}>
                  <Text style={styles.primaryBtnText}>Post Job</Text>
                </Pressable>
              ) : null}
            </View>

            {(role === "customer" || role === "admin") ? (
              <View style={styles.segmentRow}>
                <Pressable
                  style={[styles.segmentBtn, viewMode === "mine" && styles.segmentBtnActive]}
                  onPress={() => setViewMode("mine")}
                >
                  <Text style={[styles.segmentText, viewMode === "mine" && styles.segmentTextActive]}>
                    My Jobs
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentBtn, viewMode === "browse" && styles.segmentBtnActive]}
                  onPress={() => setViewMode("browse")}
                >
                  <Text style={[styles.segmentText, viewMode === "browse" && styles.segmentTextActive]}>
                    Browse Active
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Search jobs by title, category, city..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />

            {viewMode === "browse" ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Filter district (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={district}
                  onChangeText={setDistrict}
                  onSubmitEditing={loadJobs}
                />

                <View style={styles.categories}>
                  {CATEGORIES.map((category) => (
                    <Pressable
                      key={category}
                      style={[styles.pill, activeCategory === category && styles.pillActive]}
                      onPress={() => setActiveCategory(category)}
                    >
                      <Text style={[styles.pillText, activeCategory === category && styles.pillTextActive]}>
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 6 }} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No jobs found.</Text> : null}
        renderItem={({ item }) => {
          const myId = user?.userId || "";
          const hasApplied = (item.applications || []).some(
            (application) => normalizeId(application.worker) === myId
          );

          return (
            <Pressable style={styles.card} onPress={() => onOpenJob(item)}>
              <View style={styles.cardTop}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.badge}>{item.jobStatus || "active"}</Text>
              </View>
              <Text style={styles.meta}>
                {item.category} | {item.city}, {item.district}
              </Text>
              <Text style={styles.meta}>
                Budget: LKR {item.budgetMin || 0} - {item.budgetMax || 0}
              </Text>
              <Text style={styles.meta}>Start: {formatDate(item.preferredStartDate)}</Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.jobDescription}
              </Text>
              {hasApplied ? <Text style={styles.applied}>You already applied</Text> : null}
            </Pressable>
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
  content: {
    padding: layout.pagePadding,
    paddingBottom: 26,
    gap: 9,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  btn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  btnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  primaryBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  segmentText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  pillTextActive: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    gap: 4,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  jobTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    color: colors.accent,
    textTransform: "capitalize",
    fontWeight: "700",
    fontSize: 12,
  },
  meta: {
    color: colors.textMuted,
  },
  body: {
    color: colors.text,
    marginTop: 4,
  },
  applied: {
    marginTop: 4,
    color: colors.success,
    fontWeight: "700",
    fontSize: 12,
  },
  helper: {
    color: colors.textMuted,
    marginTop: 8,
  },
  error: {
    color: colors.danger,
    marginTop: 8,
  },
});
