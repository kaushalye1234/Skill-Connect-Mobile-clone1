import { useMemo, useState } from "react";
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
import { createJob } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

const CATEGORIES = [
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

const URGENCY = ["emergency", "urgent", "standard", "scheduled"];

const INITIAL_FORM = {
  jobTitle: "",
  category: "Plumbing",
  jobDescription: "",
  urgencyLevel: "standard",
  estimatedDurationHours: "2",
  district: "",
  city: "",
  locationAddress: "",
  budgetMin: "",
  budgetMax: "",
  preferredStartDate: "",
};

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export default function PostJobScreen({ navigation }) {
  const { token } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const budgetPreview = useMemo(() => {
    if (!form.budgetMin || !form.budgetMax) return "";
    const min = Number(form.budgetMin || 0);
    const max = Number(form.budgetMax || 0);
    if (Number.isNaN(min) || Number.isNaN(max)) return "";
    return `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
  }, [form.budgetMin, form.budgetMax]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (form.jobTitle.trim().length < 5) return "Job title must be at least 5 characters";
    if (!form.category) return "Select a category";
    if (form.jobDescription.trim().length < 20) return "Description must be at least 20 characters";
    if (!form.district.trim() || !form.city.trim() || !form.locationAddress.trim()) {
      return "District, city and address are required";
    }
    const min = Number(form.budgetMin || 0);
    const max = Number(form.budgetMax || 0);
    if (Number.isNaN(min) || min <= 0) return "Budget min must be a positive number";
    if (Number.isNaN(max) || max < min) return "Budget max must be greater than min";
    if (!form.preferredStartDate.trim()) return "Preferred start date is required (YYYY-MM-DD)";
    if (Number(form.estimatedDurationHours || 0) <= 0) return "Duration must be a positive number";
    return "";
  }

  async function handlePost() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setBusy(true);
      const created = await createJob(token, form);
      const jobId = normalizeId(created);
      if (!jobId) {
        throw new Error("Job created but ID is missing in response");
      }
      navigation.replace("JobDetail", { jobId, job: created });
    } catch (e) {
      setError(e.message || "Failed to post job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Post a Job</Text>
        <Text style={styles.subtitle}>Same core fields and flow from the previous React app.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Job Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Fix kitchen sink leak"
            placeholderTextColor={colors.textMuted}
            value={form.jobTitle}
            onChangeText={(value) => update("jobTitle", value)}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.wrapRow}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                style={[styles.pill, form.category === category && styles.pillActive]}
                onPress={() => update("category", category)}
              >
                <Text style={[styles.pillText, form.category === category && styles.pillTextActive]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Describe the work needed..."
            placeholderTextColor={colors.textMuted}
            value={form.jobDescription}
            onChangeText={(value) => update("jobDescription", value)}
          />

          <Text style={styles.label}>Urgency</Text>
          <View style={styles.wrapRow}>
            {URGENCY.map((item) => (
              <Pressable
                key={item}
                style={[styles.pill, form.urgencyLevel === item && styles.pillActive]}
                onPress={() => update("urgencyLevel", item)}
              >
                <Text style={[styles.pillText, form.urgencyLevel === item && styles.pillTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Estimated Duration (hours)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor={colors.textMuted}
            value={form.estimatedDurationHours}
            onChangeText={(value) => update("estimatedDurationHours", value)}
          />

          <Text style={styles.label}>District</Text>
          <TextInput
            style={styles.input}
            placeholder="Colombo"
            placeholderTextColor={colors.textMuted}
            value={form.district}
            onChangeText={(value) => update("district", value)}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Negombo"
            placeholderTextColor={colors.textMuted}
            value={form.city}
            onChangeText={(value) => update("city", value)}
          />

          <Text style={styles.label}>Address / Landmark</Text>
          <TextInput
            style={styles.input}
            placeholder="42 Main Street"
            placeholderTextColor={colors.textMuted}
            value={form.locationAddress}
            onChangeText={(value) => update("locationAddress", value)}
          />

          <Text style={styles.label}>Budget Min (LKR)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="5000"
            placeholderTextColor={colors.textMuted}
            value={form.budgetMin}
            onChangeText={(value) => update("budgetMin", value)}
          />

          <Text style={styles.label}>Budget Max (LKR)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="15000"
            placeholderTextColor={colors.textMuted}
            value={form.budgetMax}
            onChangeText={(value) => update("budgetMax", value)}
          />

          {budgetPreview ? <Text style={styles.preview}>Budget: {budgetPreview}</Text> : null}

          <Text style={styles.label}>Preferred Start Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            value={form.preferredStartDate}
            onChangeText={(value) => update("preferredStartDate", value)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.button} onPress={handlePost} disabled={busy}>
            {busy ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.buttonText}>Post Job</Text>}
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
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
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
  preview: {
    color: colors.accent,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: 3,
  },
  button: {
    marginTop: 7,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.primary,
    fontWeight: "800",
  },
});
