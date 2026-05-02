import { useCallback, useEffect, useState } from "react";
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
import { getProfile } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

function initialsFromProfile(profile) {
  const first = profile?.firstName?.[0] || "";
  const last = profile?.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "U";
}

function Item({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProfile(token);
      setProfile(data);
    } catch (e) {
      setError(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const skills = (profile?.skills || []).join(", ");
  const role = profile?.role || "customer";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Role details, account information and quick actions.</Text>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {profile ? (
          <>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initialsFromProfile(profile)}</Text>
              </View>
              <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
              <Text style={styles.role}>{role}</Text>
              <Text style={styles.meta}>
                {profile.city || "-"}, {profile.district || "-"}
              </Text>
            </View>

            <View style={styles.row}>
              <Pressable style={styles.btn} onPress={() => navigation.navigate("EditProfile")}>
                <Text style={styles.btnText}>Edit Profile</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={() => navigation.navigate("Settings")}>
                <Text style={styles.btnText}>Settings</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={loadProfile}>
                <Text style={styles.btnText}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Info</Text>
              <Item label="Email" value={profile.email} />
              <Item label="Phone" value={profile.phone} />
              <Item label="District" value={profile.district} />
              <Item label="City" value={profile.city} />
              <Item label="Bio" value={profile.bio} />
            </View>

            {role === "worker" ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Work Profile</Text>
                <Item label="Hourly Rate" value={profile.hourlyRate ? `LKR ${profile.hourlyRate}/hr` : "-"} />
                <Item label="Experience" value={profile.experience} />
                <Item label="Skills" value={skills || "-"} />
              </View>
            ) : null}

            {role === "supplier" ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Supplier Info</Text>
                <Item label="Company Name" value={profile.companyName} />
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shortcuts</Text>
              <View style={styles.shortcutRow}>
                <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Bookings")}>
                  <Text style={styles.shortcutText}>Bookings</Text>
                </Pressable>
                <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Complaints")}>
                  <Text style={styles.shortcutText}>Complaints</Text>
                </Pressable>
                <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Reviews")}>
                  <Text style={styles.shortcutText}>Reviews</Text>
                </Pressable>
                <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Workers")}>
                  <Text style={styles.shortcutText}>Workers</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        <Pressable style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 2,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 24,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  role: {
    color: colors.accent,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
  },
  shortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  shortcut: {
    width: "48%",
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  shortcutText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
  },
});
