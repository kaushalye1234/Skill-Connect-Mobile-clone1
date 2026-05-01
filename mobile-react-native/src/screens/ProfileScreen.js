import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/apiClient";

export default function ProfileScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Jobs</Text>
      </Pressable>

      {loading ? <ActivityIndicator size="large" color="#2d7ef7" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {profile ? (
        <View style={styles.card}>
          <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.meta}>Email: {profile.email}</Text>
          <Text style={styles.meta}>Role: {profile.role}</Text>
          <Text style={styles.meta}>Phone: {profile.phone || "-"}</Text>
          <Text style={styles.meta}>District: {profile.district || "-"}</Text>
          <Text style={styles.meta}>City: {profile.city || "-"}</Text>
        </View>
      ) : null}

      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    gap: 12,
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  meta: {
    color: "#334155",
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: "#dc2626",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
