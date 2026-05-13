/**
 * DECORE Navigation Architecture
 * ================================
 * 
 * This file provides the complete navigation setup for the DECORE app.
 * 
 * Structure:
 * - RootNavigator (Stack)
 *   ├── Auth Stack
 *   │   └── Login/Register
 *   └── Main Stack
 *       └── DrawerNavigator
 *           ├── BottomTabNavigator (Home, Create, Gallery, Settings)
 *           └── Drawer Items (Language, Quick Camera, Help, Support)
 */

import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme as DefaultDarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../src/theme/colors';
import { DrawerContent } from '../src/components/DrawerContent';
import { BottomTabBar, TabItem } from '../src/components/BottomTabBar';

// Screen imports
// Home and Main Screens
// import HomeScreen from './index';
// import UploadScreenProduction from '../src/screens/UploadScreenProduction';
// import CreateDesignScreenProduction from '../src/screens/CreateDesignScreenProduction';
// import GalleryScreenProduction from '../src/screens/GalleryScreenProduction';
// import SettingsScreenProduction from '../src/screens/SettingsScreenProduction';

// Auth screens
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';

// Additional screens
// import AccountInfoScreen from './accountInfo';
// import ResultScreen from './result';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const BottomTabs = createBottomTabNavigator();

// Custom Dark Theme
const DarkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

/**
 * BOTTOM TAB NAVIGATOR
 * Contains: Home, Create, Gallery, Settings
 */
function BottomTabNavigator() {
  const tabs: TabItem[] = [
    { name: 'home', label: 'Asosiy', icon: 'home' },
    { name: 'create', label: 'Yaratish', icon: 'add-circle' },
    { name: 'gallery', label: 'Galereya', icon: 'images' },
    { name: 'settings', label: 'Sozlamalar', icon: 'settings' },
  ];

  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
      tabBar={(props) => (
        <BottomTabBar
          tabs={tabs}
          activeTab={props.state.routes[props.state.index].name}
          onTabPress={({ name }) => {
            const event = props.navigation.emit({
              type: 'tabPress',
              target: name,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              props.navigation.navigate(name);
            }
          }}
        />
      )}
    >
      {/* Home Tab will point to your index.tsx */}
      {/* <BottomTabs.Screen
        name="home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <BottomTabs.Screen
        name="create"
        component={UploadScreenProduction}
        options={{ title: 'Create' }}
      />
      <BottomTabs.Screen
        name="gallery"
        component={GalleryScreenProduction}
        options={{ title: 'Gallery' }}
      />
      <BottomTabs.Screen
        name="settings"
        component={SettingsScreenProduction}
        options={{ title: 'Settings' }}
      /> */}
    </BottomTabs.Navigator>
  );
}

/**
 * DRAWER NAVIGATOR
 * Main content is BottomTabNavigator
 * Drawer items: Language, Quick Camera, Help, Support
 */
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
        drawerStyle: {
          backgroundColor: colors.background,
          width: '75%',
        },
        drawerLabelStyle: {
          fontSize: 14,
        },
      }}
      drawerContent={(props) => <DrawerContent />}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          title: 'Home',
          drawerLabel: 'Home',
        }}
      />
    </Drawer.Navigator>
  );
}

/**
 * ROOT NAVIGATOR
 * Handles Auth vs Main stack
 */
export function RootNavigator() {
  // You can check auth state here
  const isSignedIn = true; // Replace with actual auth check

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {isSignedIn ? (
          // Main app stack (authenticated)
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen
              name="MainDrawer"
              component={DrawerNavigator}
              options={{ title: 'DECORE' }}
            />
            {/* Additional screens (modals, details sheets) */}
            {/* <Stack.Screen
              name="CreateDesign"
              component={CreateDesignScreenProduction}
              options={{
                presentation: 'modal',
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                presentation: 'modal',
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="AccountInfo"
              component={AccountInfoScreen}
              options={{
                presentation: 'modal',
                animationEnabled: true,
              }}
            /> */}
          </Stack.Group>
        ) : (
          // Auth stack (unauthenticated)
          <Stack.Group
            screenOptions={{
              animationEnabled: false,
              headerShown: false,
            }}
          >
            {/* <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            /> */}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
