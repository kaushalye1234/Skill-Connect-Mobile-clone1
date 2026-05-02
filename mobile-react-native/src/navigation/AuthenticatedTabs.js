import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import BookingsScreen from "../screens/BookingsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import EquipmentScreen from "../screens/EquipmentScreen";
import JobsScreen from "../screens/JobsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../styles/theme";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home-outline",
  Jobs: "hammer-outline",
  Bookings: "calendar-outline",
  Equipment: "construct-outline",
  Profile: "person-outline",
};

export default function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Equipment" component={EquipmentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
