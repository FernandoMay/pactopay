import { Tabs } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.outlineVariant,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.labelSmall,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => null, // Material icon to be added
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color }) => null,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contratos',
          tabBarIcon: ({ color }) => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => null,
        }}
      />
    </Tabs>
  );
}