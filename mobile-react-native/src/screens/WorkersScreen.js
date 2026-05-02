import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getWorkers } from "../services/apiClient";
import { colors, layout } from "../styles/theme";

export default function WorkersScreen({ navigation }) {
  const { token } = useAuth();
  const [district, setDistrict] = useState("");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getWorkers(token, district);
      setWorkers(data);
    } catch (e) {
      setError(e.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  }, [token, district]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Workers</Text>
        <TextInput
          style={styles.input}
          placeholder="Filter by district"
          placeholderTextColor={colors.textMuted}
          value={district}
          onChangeText={setDistrict}
          onSubmitEditing={loadWorkers}
        />
        <Pressable style={styles.refreshBtn} onPress={loadWorkers}>
          <Text style={styles.refreshText}>Search</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <Text style={styles.helper}>Loading workers...</Text> : null}
      </View>

      <FlatList
        data={workers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.helper}>No workers found.</Text> : null}
        renderItem={({ item }) => {
          const name = `${item.firstName || ""} ${item.lastName || ""}`.trim();
          const skills = (item.skills || []).slice(0, 3).join(", ");
          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate("WorkerProfile", { workerId: item._id })}
            >
              <Text style={styles.name}>{name || "Worker"}</Text>
              <Text style={styles.meta}>
                {item.city || "-"}, {item.district || "-"}
              </Text>
              {skills ? <Text style={styles.meta}>Skills: {skills}</Text> : null}
              <Text style={styles.rate}>LKR {item.hourlyRate || 0}/hr</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: layout.pagePadding,
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  refreshBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  refreshText: {
    color: colors.primary,
    fontWeight: "800",
  },
  error: {
    color: colors.danger,
    fontWeight: "600",
  },
  helper: {
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 20,
    gap: 9,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
  },
  name: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  rate: {
    marginTop: 8,
    color: colors.accent,
    fontWeight: "700",
  },
});
