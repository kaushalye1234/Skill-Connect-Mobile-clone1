import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import BookingsScreen from "../screens/BookingsScreen";
import ComplaintsScreen from "../screens/ComplaintsScreen";
import EquipmentScreen from "../screens/EquipmentScreen";
import JobsScreen from "../screens/JobsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReviewsScreen from "../screens/ReviewsScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Jobs: "briefcase-outline",
  Bookings: "calendar-outline",
  Equipment: "construct-outline",
  Complaints: "alert-circle-outline",
  Reviews: "star-outline",
  Profile: "person-outline",
};

export default function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#1d4ed8",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Equipment" component={EquipmentScreen} />
      <Tab.Screen name="Complaints" component={ComplaintsScreen} />
      <Tab.Screen name="Reviews" component={ReviewsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
