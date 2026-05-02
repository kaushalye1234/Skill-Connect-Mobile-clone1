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
import { colors, layout } from "../styles/theme";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  district: "",
  city: "",
  role: "customer",
  skillsText: "",
  hourlyRate: "",
  experience: "",
  companyName: "",
};

const ROLES = ["customer", "worker", "supplier", "admin"];

function roleLabel(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isWorker = form.role === "worker";
  const isSupplier = form.role === "supplier";

  const tips = useMemo(() => {
    if (isWorker) return "Add your skills and hourly rate so customers can find you faster.";
    if (isSupplier) return "Add your company name so equipment customers can trust your listing.";
    return "You can update most profile details later from the profile screen.";
  }, [isWorker, isSupplier]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return "First and last name are required";
    if (!form.email.trim() || !form.email.includes("@")) return "A valid email is required";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) return "Phone must have at least 10 digits";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return "Password must include an uppercase letter and a number";
    }
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.district.trim() || !form.city.trim()) return "District and city are required";
    if (isWorker && !form.skillsText.trim()) return "Worker skills are required";
    if (isWorker && form.hourlyRate && Number(form.hourlyRate) <= 0) return "Hourly rate must be positive";
    if (isSupplier && !form.companyName.trim()) return "Company name is required for suppliers";
    if (!agreed) return "You must agree to terms before registering";
    return "";
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await signUp({
        ...form,
        skills: form.skillsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Create SkillConnect Account</Text>
        <Text style={styles.subtitle}>Role-based signup with the same flow as the previous React app.</Text>

        <View style={styles.roleRow}>
          {ROLES.map((role) => (
            <Pressable
              key={role}
              style={[styles.rolePill, form.role === role && styles.rolePillActive]}
              onPress={() => updateField("role", role)}
            >
              <Text style={[styles.rolePillText, form.role === role && styles.rolePillTextActive]}>
                {roleLabel(role)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.textMuted}
          value={form.firstName}
          onChangeText={(v) => updateField("firstName", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor={colors.textMuted}
          value={form.lastName}
          onChangeText={(v) => updateField("lastName", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => updateField("email", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => updateField("phone", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password (6+, uppercase + number)"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={form.password}
          onChangeText={(v) => updateField("password", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(v) => updateField("confirmPassword", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="District"
          placeholderTextColor={colors.textMuted}
          value={form.district}
          onChangeText={(v) => updateField("district", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor={colors.textMuted}
          value={form.city}
          onChangeText={(v) => updateField("city", v)}
        />

        {isWorker ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Skills (comma separated)"
              placeholderTextColor={colors.textMuted}
              value={form.skillsText}
              onChangeText={(v) => updateField("skillsText", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Hourly rate (LKR)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={form.hourlyRate}
              onChangeText={(v) => updateField("hourlyRate", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Experience (e.g. 5 years)"
              placeholderTextColor={colors.textMuted}
              value={form.experience}
              onChangeText={(v) => updateField("experience", v)}
            />
          </>
        ) : null}

        {isSupplier ? (
          <TextInput
            style={styles.input}
            placeholder="Company / business name"
            placeholderTextColor={colors.textMuted}
            value={form.companyName}
            onChangeText={(v) => updateField("companyName", v)}
          />
        ) : null}

        <Text style={styles.tip}>{tips}</Text>

        <Pressable style={styles.termsRow} onPress={() => setAgreed((prev) => !prev)}>
          <View style={[styles.check, agreed && styles.checkActive]}>
            {agreed ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.buttonText}>Register</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
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
    paddingBottom: 30,
    gap: 10,
  },
  back: {
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
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
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  rolePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rolePillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rolePillText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
  rolePillTextActive: {
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  tip: {
    color: colors.textMuted,
    fontSize: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkMark: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
  },
  termsText: {
    color: colors.text,
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
  },
  link: {
    color: colors.accent,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
});
