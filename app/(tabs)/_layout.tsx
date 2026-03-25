import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { COLORS } from "../../src/constants/theme";

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-1 gap-0.5">
      <Text className={`text-2xl ${focused ? "" : "opacity-50"}`}>{icon}</Text>
      <Text
        className={`text-[10px] font-semibold ${
          focused ? "text-brand-primary" : "text-brand-muted"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: "#2A2A4A",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🌍" label="Explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" label="Challenges" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🐰" label="Network" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
