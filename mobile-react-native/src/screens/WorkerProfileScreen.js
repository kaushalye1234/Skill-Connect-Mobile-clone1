import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getWorkerProfile } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

export default function WorkerProfileScreen({ route }) {
  const { token } = useAuth();
  const workerId = route.params?.workerId;

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const profile = await getWorkerProfile(token, workerId);
        setWorker(profile);
      } catch (e) {
        setError(e.message || "Failed to load worker profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, workerId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {worker ? (
          <>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {`${worker.firstName?.[0] || ""}${worker.lastName?.[0] || ""}`.toUpperCase() || "W"}
                </Text>
              </View>
              <Text style={styles.name}>{worker.firstName} {worker.lastName}</Text>
              <Text style={styles.role}>{worker.role}</Text>
              <Text style={styles.city}>
                {worker.city || "-"}, {worker.district || "-"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contact</Text>
              <Text style={styles.meta}>Email: {worker.email || "-"}</Text>
              <Text style={styles.meta}>Phone: {worker.phone || "-"}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Skills & Experience</Text>
              <Text style={styles.meta}>Rate: LKR {worker.hourlyRate || 0}/hr</Text>
              <Text style={styles.meta}>Experience: {worker.experience || "-"}</Text>
              <Text style={styles.meta}>Skills: {(worker.skills || []).join(", ") || "-"}</Text>
              {worker.bio ? <Text style={styles.bio}>{worker.bio}</Text> : null}
            </View>
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
    gap: 10,
  },
  error: {
    color: colors.danger,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  name: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 20,
  },
  role: {
    color: colors.accent,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "capitalize",
  },
  city: {
    color: colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 3,
  },
  meta: {
    color: colors.textMuted,
  },
  bio: {
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
});
