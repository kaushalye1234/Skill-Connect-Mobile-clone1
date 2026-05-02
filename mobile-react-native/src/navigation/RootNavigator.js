import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import ComplaintsScreen from "../screens/ComplaintsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import JobDetailScreen from "../screens/JobDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import MyApplicationsScreen from "../screens/MyApplicationsScreen";
import PostJobScreen from "../screens/PostJobScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import WorkerProfileScreen from "../screens/WorkerProfileScreen";
import WorkersScreen from "../screens/WorkersScreen";
import { colors } from "../styles/theme";
import AuthenticatedTabs from "./AuthenticatedTabs";

const Stack = createNativeStackNavigator();

function SplashScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2d7ef7" />
    </View>
  );
}

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!token ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.text },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.text },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="MainTabs" component={AuthenticatedTabs} options={{ headerShown: false }} />
          <Stack.Screen name="PostJob" component={PostJobScreen} options={{ title: "Post Job" }} />
          <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: "Job Detail" }} />
          <Stack.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: "My Applications" }} />
          <Stack.Screen name="Workers" component={WorkersScreen} options={{ title: "Workers" }} />
          <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} options={{ title: "Worker Profile" }} />
          <Stack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: "Complaints" }} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Reviews" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
});
