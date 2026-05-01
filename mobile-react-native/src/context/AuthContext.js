import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login, register } from "../services/apiClient";

const TOKEN_KEY = "sc_token";
const USER_KEY = "sc_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const savedUser = await AsyncStorage.getItem(USER_KEY);

        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (_e) {
        setAuthError("Failed to restore session");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persistSession(nextToken, nextUser) {
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function signIn(email, password) {
    setAuthError("");
    const data = await login(email.trim().toLowerCase(), password);
    await persistSession(data.token, data);
  }

  async function signUp(form) {
    setAuthError("");
    const data = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      role: form.role,
      district: form.district.trim(),
      city: form.city.trim(),
    });
    await persistSession(data.token, data);
  }

  async function signOut() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, authError, setAuthError, signIn, signUp, signOut }),
    [token, user, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
