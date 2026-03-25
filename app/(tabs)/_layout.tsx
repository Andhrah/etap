/**
 * @fileoverview Bottom tab navigation layout.
 * @module app/(tabs)/_layout
 */
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@theme/use-app-theme';

/**
 * Tab bar icon component props.
 */
type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

/**
 * Renders a tab bar icon with consistent sizing.
 */
const TabIcon = ({ name, color }: TabIconProps) => (
  <Ionicons name={name} size={24} color={color} />
);

/**
 * Bottom tab navigator with Map, Fences, and Settings tabs.
 */
const TabsLayout = () => {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          height: 120,
          // paddingBottom: 30
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'MAP',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="fences"
        options={{
          title: 'FENCES',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'git-network' : 'git-network-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
