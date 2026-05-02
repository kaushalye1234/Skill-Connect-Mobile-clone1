import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, layout } from "../styles/theme";

const DEFAULTS = {
  notifications_bookings: true,
  notifications_jobs: true,
  notifications_promotions: false,
  location_enabled: true,
  biometric_enabled: false,
  data_saver: false,
};

export default function SettingsScreen({ navigation }) {
  const { signOut, user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(
          Object.keys(DEFAULTS).map((key) => `settings_${key}`)
        );
        const next = { ...DEFAULTS };
        entries.forEach(([fullKey, value]) => {
          if (value === null) return;
          const shortKey = fullKey.replace("settings_", "");
          next[shortKey] = value === "true";
        });
        setSettings(next);
      } catch (_e) {
        setSettings(DEFAULTS);
      }
    })();
  }, []);

  async function toggle(key) {
    const nextValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: nextValue }));
    await AsyncStorage.setItem(`settings_${key}`, String(nextValue));
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Notifications, privacy and account preferences.</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{user?.name || "SkillConnect User"}</Text>
          <Text style={styles.profileMeta}>{user?.role || "customer"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingRow
            label="Booking Updates"
            sub="Booking status and changes"
            value={settings.notifications_bookings}
            onValueChange={() => toggle("notifications_bookings")}
          />
          <SettingRow
            label="Job Alerts"
            sub="New jobs and matching work"
            value={settings.notifications_jobs}
            onValueChange={() => toggle("notifications_jobs")}
          />
          <SettingRow
            label="Promotions"
            sub="Product and campaign updates"
            value={settings.notifications_promotions}
            onValueChange={() => toggle("notifications_promotions")}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <SettingRow
            label="Location Services"
            sub="Nearby jobs and workers"
            value={settings.location_enabled}
            onValueChange={() => toggle("location_enabled")}
          />
          <SettingRow
            label="Biometric Login"
            sub="Fingerprint / Face ID (local)"
            value={settings.biometric_enabled}
            onValueChange={() => toggle("biometric_enabled")}
          />
          <SettingRow
            label="Data Saver"
            sub="Reduce bandwidth usage"
            value={settings.data_saver}
            onValueChange={() => toggle("data_saver")}
          />
        </View>

        <Pressable style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, sub, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.accent, false: "#334155" }}
        thumbColor={value ? colors.primary : "#cbd5e1"}
      />
    </View>
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
  back: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 6,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
  },
  profileName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  profileMeta: {
    color: colors.textMuted,
    textTransform: "capitalize",
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    color: colors.text,
    fontWeight: "700",
  },
  rowSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 4,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "800",
  },
});
