import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getJobs } from "../services/apiClient";

export default function JobsScreen({ navigation }) {
  const { token, user, signOut } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const list = await getJobs(token);
      setJobs(list);
    } catch (e) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ScrollView style={styles.headerWrap}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Welcome, {user?.name || "User"}</Text>
              <Pressable onPress={() => navigation.navigate("Profile")}>
                <Text style={styles.link}>Profile</Text>
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryButton} onPress={loadJobs}>
                <Text style={styles.secondaryButtonText}>Refresh Jobs</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={signOut}>
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </Pressable>
            </View>

            <View style={styles.moduleGrid}>
              <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate("Bookings")}>
                <Text style={styles.moduleTitle}>Bookings</Text>
                <Text style={styles.moduleSub}>List + create + status actions</Text>
              </Pressable>
              <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate("Equipment")}>
                <Text style={styles.moduleTitle}>Equipment</Text>
                <Text style={styles.moduleSub}>List + supplier create flow</Text>
              </Pressable>
              <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate("Complaints")}>
                <Text style={styles.moduleTitle}>Complaints</Text>
                <Text style={styles.moduleSub}>List + complaint submission</Text>
              </Pressable>
              <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate("Reviews")}>
                <Text style={styles.moduleTitle}>Reviews</Text>
                <Text style={styles.moduleSub}>List + review submission</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Active Jobs</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? <Text style={styles.helper}>Loading jobs...</Text> : null}
          </ScrollView>
        }
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No active jobs found.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <Text style={styles.meta}>{item.category} | {item.district}</Text>
            <Text style={styles.body} numberOfLines={3}>{item.jobDescription}</Text>
            <Text style={styles.meta}>Budget: Rs. {item.budgetMin} - Rs. {item.budgetMax}</Text>
          </View>
        )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: "#1e293b",
    fontWeight: "600",
  },
  moduleGrid: {
    marginBottom: 14,
  },
  moduleBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  moduleSub: {
    color: "#334155",
    marginTop: 4,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  error: {
    color: "#dc2626",
    marginBottom: 8,
  },
  helper: {
    color: "#475569",
    marginBottom: 8,
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
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    color: "#475569",
    marginTop: 4,
  },
  body: {
    color: "#334155",
    marginTop: 8,
    marginBottom: 6,
  },
});
