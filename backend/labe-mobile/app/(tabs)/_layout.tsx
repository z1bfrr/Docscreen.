import { Tabs } from 'expo-router';
import { HomeIcon, TestsIcon, BookingsIcon, OrdersIcon, ProfileIcon, ActivityIcon, LpgIcon } from '../../src/components/CustomIcons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, // We will use custom immersive headers
      tabBarActiveTintColor: '#2952e3',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        elevation: 0,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="labs"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color }) => <TestsIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <BookingsIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <ActivityIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lpg"
        options={{
          title: 'Gas',
          tabBarIcon: ({ color }) => <LpgIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
