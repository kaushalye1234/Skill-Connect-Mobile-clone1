import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  district: "",
  city: "",
  role: "customer",
};

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.firstName || !form.email || !form.password) {
      setError("First name, email and password are required");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await signUp(form);
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput style={styles.input} placeholder="First name" value={form.firstName} onChangeText={(v) => updateField("firstName", v)} />
        <TextInput style={styles.input} placeholder="Last name" value={form.lastName} onChangeText={(v) => updateField("lastName", v)} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => updateField("email", v)} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={(v) => updateField("password", v)} />
        <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(v) => updateField("phone", v)} />
        <TextInput style={styles.input} placeholder="District" value={form.district} onChangeText={(v) => updateField("district", v)} />
        <TextInput style={styles.input} placeholder="City" value={form.city} onChangeText={(v) => updateField("city", v)} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2d7ef7",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
  },
});
