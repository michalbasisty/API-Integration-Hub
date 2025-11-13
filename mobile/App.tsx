import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';

const Tab = createBottomTabNavigator();

// Dashboard Screen
const DashboardScreen = () => {
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/status');
      setStatus(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="app-container">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🚀 PulseAPI</Text>
          <Text style={styles.subtitle}>API Performance Monitor</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : status ? (
          <View style={styles.statusCards}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Backend API</Text>
              <Text style={[styles.cardStatus, { color: '#38a169' }]}>
                {status.status || 'OK'}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Database</Text>
              <Text style={[styles.cardStatus, { color: status.database === 'connected' ? '#38a169' : '#e53e3e' }]}>
                {status.database}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Redis</Text>
              <Text style={[styles.cardStatus, { color: status.redis === 'connected' ? '#38a169' : '#e53e3e' }]}>
                {status.redis}
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={fetchStatus}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Alerts Screen
const AlertsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active alerts</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>API Endpoint</Text>
          <Text style={styles.settingValue}>http://localhost:8000</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Check Interval</Text>
          <Text style={styles.settingValue}>60 seconds</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <View testID="navigator" style={{ flex: 1 }}>
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#cbd5e0',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            tabBarLabel: 'Alerts',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  loader: {
    marginTop: 32,
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#742a2a',
    fontWeight: '500',
  },
  statusCards: {
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    color: '#4a5568',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyBox: {
    backgroundColor: '#f7fafc',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    color: '#718096',
    fontWeight: '500',
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  settingLabel: {
    fontSize: 12,
    color: '#4a5568',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#2d3748',
  },
});
