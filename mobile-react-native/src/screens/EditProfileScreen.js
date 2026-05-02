import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

export default function EditProfileScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    district: "",
    city: "",
    hourlyRate: "",
    experience: "",
    skillsText: "",
    companyName: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile(token);
        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          bio: data.bio || "",
          district: data.district || "",
          city: data.city || "",
          hourlyRate: data.hourlyRate ? String(data.hourlyRate) : "",
          experience: data.experience || "",
          skillsText: (data.skills || []).join(", "),
          companyName: data.companyName || "",
        });
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return "First and last name are required";
    if (!/^07\d{8}$/.test(form.phone.trim())) return "Phone must look like 07XXXXXXXX";
    if (!form.district.trim() || !form.city.trim()) return "District and city are required";
    if (profile?.role === "worker" && Number(form.hourlyRate || 0) <= 0) return "Hourly rate must be positive";
    if (profile?.role === "supplier" && !form.companyName.trim()) return "Company name is required";
    return "";
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
    };

    if (profile?.role === "worker") {
      payload.hourlyRate = Number(form.hourlyRate || 0);
      payload.experience = form.experience.trim();
      payload.skills = form.skillsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (profile?.role === "supplier") {
      payload.companyName = form.companyName.trim();
    }

    try {
      setSaving(true);
      setError("");
      await updateProfile(token, payload);
      navigation.goBack();
    } catch (e) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update personal info and role-specific details.</Text>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}

        {!loading && profile ? (
          <View style={styles.card}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              value={form.firstName}
              onChangeText={(value) => update("firstName", value)}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              value={form.lastName}
              onChangeText={(value) => update("lastName", value)}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="07XXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(value) => update("phone", value)}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              placeholder="Tell users about your services..."
              placeholderTextColor={colors.textMuted}
              value={form.bio}
              onChangeText={(value) => update("bio", value)}
            />

            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              value={form.district}
              onChangeText={(value) => update("district", value)}
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.textMuted}
              value={form.city}
              onChangeText={(value) => update("city", value)}
            />

            {profile.role === "worker" ? (
              <>
                <Text style={styles.label}>Hourly Rate (LKR)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                  value={form.hourlyRate}
                  onChangeText={(value) => update("hourlyRate", value)}
                />

                <Text style={styles.label}>Experience</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Beginner / Intermediate / Professional / Expert"
                  placeholderTextColor={colors.textMuted}
                  value={form.experience}
                  onChangeText={(value) => update("experience", value)}
                />

                <Text style={styles.label}>Skills (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Plumbing, Electrical"
                  placeholderTextColor={colors.textMuted}
                  value={form.skillsText}
                  onChangeText={(value) => update("skillsText", value)}
                />
              </>
            ) : null}

            {profile.role === "supplier" ? (
              <>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                  value={form.companyName}
                  onChangeText={(value) => update("companyName", value)}
                />
              </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.saveText}>Save Changes</Text>}
            </Pressable>
          </View>
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
    paddingBottom: 30,
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
  },
  card: {
    marginTop: 4,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: 14,
    gap: 8,
  },
  label: {
    color: colors.text,
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: 3,
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 10,
    minHeight: 46,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: colors.primary,
    fontWeight: "800",
  },
});
