import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getJobs, getMyBookings, getMyJobs } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

export default function DashboardScreen({ navigation }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    bookings: 0,
    jobs: 0,
  });
  const [loading, setLoading] = useState(true);

  const role = user?.role || "customer";

  const quickActions = useMemo(() => {
    if (role === "worker") {
      return [
        { label: "Browse Jobs", route: "Jobs", hint: "Find nearby opportunities" },
        { label: "My Applications", route: "MyApplications", hint: "Track pending/accepted jobs" },
        { label: "My Bookings", route: "Bookings", hint: "Upcoming and completed work" },
        { label: "My Complaints", route: "Complaints", hint: "Support and dispute tracking" },
      ];
    }

    if (role === "supplier") {
      return [
        { label: "My Equipment", route: "Equipment", hint: "Manage tool listings" },
        { label: "Browse Jobs", route: "Jobs", hint: "See market demand" },
        { label: "Complaints", route: "Complaints", hint: "Issue management" },
        { label: "Reviews", route: "Reviews", hint: "Ratings and feedback" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "All Complaints", route: "Complaints", hint: "Resolve disputes quickly" },
        { label: "Users", route: "Workers", hint: "Inspect worker profiles" },
        { label: "Reviews", route: "Reviews", hint: "Audit platform quality" },
        { label: "Jobs", route: "Jobs", hint: "Observe activity" },
      ];
    }

    return [
      { label: "Browse Jobs", route: "Jobs", hint: "Find trusted workers" },
      { label: "Post a Job", route: "PostJob", hint: "Create a new request" },
      { label: "Find Workers", route: "Workers", hint: "Browse by district and skills" },
      { label: "My Bookings", route: "Bookings", hint: "Track ongoing service" },
    ];
  }, [role]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingRes, jobsRes] = await Promise.all([
        getMyBookings(token, role === "worker" ? "worker" : "customer"),
        role === "customer" ? getMyJobs(token) : getJobs(token),
      ]);

      setStats({
        bookings: bookingRes.length,
        jobs: jobsRes.length,
      });
    } catch (_e) {
      setStats({ bookings: 0, jobs: 0 });
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.hello}>Hello, {user?.name || "User"}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        <Text style={styles.sub}>SkillConnect dashboard with role-aware actions.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            {loading ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.statValue}>{stats.bookings}</Text>}
            <Text style={styles.statLabel}>My Bookings</Text>
          </View>
          <View style={styles.statCard}>
            {loading ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.statValue}>{stats.jobs}</Text>}
            <Text style={styles.statLabel}>{role === "customer" ? "Posted Jobs" : "Job Feed"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action) => (
          <Pressable key={action.label} style={styles.actionCard} onPress={() => navigation.navigate(action.route)}>
            <Text style={styles.actionTitle}>{action.label}</Text>
            <Text style={styles.actionHint}>{action.hint}</Text>
          </Pressable>
        ))}

        <View style={styles.footerRow}>
          <Pressable style={styles.refreshBtn} onPress={loadStats}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
          <Pressable style={styles.refreshBtn} onPress={() => navigation.navigate("Settings")}>
            <Text style={styles.refreshText}>Settings</Text>
          </Pressable>
        </View>
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    color: colors.accent,
    textTransform: "capitalize",
    fontWeight: "700",
    fontSize: 12,
  },
  sub: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    minHeight: 90,
    justifyContent: "center",
  },
  statValue: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 9,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  actionHint: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  refreshBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
  },
  refreshText: {
    color: colors.text,
    fontWeight: "600",
  },
});
