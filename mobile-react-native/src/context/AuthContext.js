import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login, register } from "../services/apiClient";

const TOKEN_KEY = "sc_token";
const USER_KEY = "sc_user";
const STORAGE_TIMEOUT_MS = 2500;

const AuthContext = createContext(null);

function withTimeout(promise, timeoutMs, fallback = null) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          withTimeout(AsyncStorage.getItem(TOKEN_KEY), STORAGE_TIMEOUT_MS),
          withTimeout(AsyncStorage.getItem(USER_KEY), STORAGE_TIMEOUT_MS),
        ]);

        if (!mounted) {
          return;
        }

        if (savedToken) {
          setToken(savedToken);
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (_e) {
        if (mounted) {
          setAuthError("Failed to restore session");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
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
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim(),
      role: form.role,
      district: form.district.trim(),
      city: form.city.trim(),
    };

    if (form.role === "worker") {
      payload.skills = (form.skills || [])
        .map((item) => String(item).trim())
        .filter(Boolean);
      payload.hourlyRate = form.hourlyRate ? Number(form.hourlyRate) : undefined;
      payload.experience = form.experience?.trim() || "";
    }

    if (form.role === "supplier") {
      payload.companyName = form.companyName?.trim() || "";
    }

    const data = await register({
      ...payload,
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
