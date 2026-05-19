import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { apiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { RoleSwitcher } from '../components/RoleSwitcher';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, currentViewMode, switchViewMode, canSwitchToShopOwner } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(user);

  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL || 'https://localshop.app/privacy';
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL || 'https://localshop.app/terms';
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL || 'mailto:support@localshop.app';

  const handleOpenUrl = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unable to open link', url);
      return;
    }
    await Linking.openURL(url);
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Delete account',
      'Enter your password to permanently delete your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) {
              Alert.alert('Password required', 'Please enter your password.');
              return;
            }
            try {
              await apiService.deleteAccount(password);
              await logout();
              Alert.alert('Account deleted', 'Your account has been removed.');
            } catch (error) {
              Alert.alert('Error', 'Could not delete account. Check your password and try again.');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewModeSwitch = () => {
    const newMode = currentViewMode === 'customer' ? 'shop_owner' : 'customer';
    switchViewMode(newMode);
    Alert.alert(
      'View Mode Changed',
      `Switched to ${newMode === 'customer' ? 'Customer' : 'Shop Owner'} view`,
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update user profile
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const updateField = (field: string, value: any) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value,
      });
    }
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ProfileField = ({ label, value, editable = false, onChangeText }: {
    label: string;
    value: string;
    editable?: boolean;
    onChangeText?: (text: string) => void;
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
      )}
    </View>
  );

  const PreferenceToggle = ({ label, value, onValueChange }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.preferenceRow}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#667eea' }}
        thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
  );

  if (!user) {
    return (
      <ScreenWrapper>
        <Text style={styles.errorText}>User not found</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            {/* Role Switcher - Development Mode */}
            {/* TODO: Remove this when authentication is re-enabled */}
            <RoleSwitcher />
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedUser(user);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Text>
            </View>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userRole}>
              {user.role === 'shop_owner' ? 'Shop Owner' : 'Customer'}
            </Text>
          </View>

          {/* Personal Information */}
          <ProfileSection title="Personal Information">
            <ProfileField
              label="First Name"
              value={editedUser?.firstName || ''}
              editable={true}
              onChangeText={(text) => updateField('firstName', text)}
            />
            <ProfileField
              label="Last Name"
              value={editedUser?.lastName || ''}
              editable={true}
              onChangeText={(text) => updateField('lastName', text)}
            />
            <ProfileField
              label="Email"
              value={editedUser?.email || ''}
              editable={true}
              onChangeText={(text) => updateField('email', text)}
            />
            <ProfileField
              label="Phone"
              value={editedUser?.phone || ''}
              editable={true}
              onChangeText={(text) => updateField('phone', text)}
            />
            <ProfileField
              label="Username"
              value={editedUser?.username || ''}
            />
          </ProfileSection>

          {/* View Mode Switching - Only for Shop Owners */}
          {canSwitchToShopOwner() && (
            <ProfileSection title="App View Mode">
              <View style={styles.viewModeContainer}>
                <View style={styles.viewModeInfo}>
                  <Text style={styles.viewModeTitle}>Current View Mode</Text>
                  <Text style={styles.viewModeDescription}>
                    {currentViewMode === 'customer' 
                      ? 'You are currently viewing the app as a customer. Switch to shop owner mode to manage your shops and products.'
                      : 'You are currently viewing the app as a shop owner. Switch to customer mode to browse and shop from other stores.'
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewModeSwitchButton}
                  onPress={handleViewModeSwitch}
                >
                  <Text style={styles.viewModeSwitchText}>
                    Switch to {currentViewMode === 'customer' ? 'Shop Owner' : 'Customer'} Mode
                  </Text>
                </TouchableOpacity>
              </View>
            </ProfileSection>
          )}

          {/* Location */}
          <ProfileSection title="Location">
            <ProfileField
              label="City"
              value={editedUser?.location?.city || ''}
              editable={true}
              onChangeText={(text) => updateField('location', { ...editedUser?.location, city: text })}
            />
            <ProfileField
              label="Province"
              value={editedUser?.location?.province || ''}
              editable={true}
              onChangeText={(text) => updateField('location', { ...editedUser?.location, province: text })}
            />
          </ProfileSection>

          {/* Preferences */}
          <ProfileSection title="Preferences">
            <PreferenceToggle
              label="Email Notifications"
              value={editedUser?.preferences?.notifications?.email || false}
              onValueChange={(value) => updateField('preferences', {
                ...editedUser?.preferences,
                notifications: { ...editedUser?.preferences?.notifications, email: value }
              })}
            />
            <PreferenceToggle
              label="Push Notifications"
              value={editedUser?.preferences?.notifications?.push || false}
              onValueChange={(value) => updateField('preferences', {
                ...editedUser?.preferences,
                notifications: { ...editedUser?.preferences?.notifications, push: value }
              })}
            />
          </ProfileSection>

          {/* Dietary Preferences */}
          <ProfileSection title="Dietary Preferences">
            <PreferenceToggle
              label="Vegetarian"
              value={editedUser?.preferences?.dietary?.isVegetarian || false}
              onValueChange={(value) => updateField('preferences', {
                ...editedUser?.preferences,
                dietary: { ...editedUser?.preferences?.dietary, isVegetarian: value }
              })}
            />
            <PreferenceToggle
              label="Vegan"
              value={editedUser?.preferences?.dietary?.isVegan || false}
              onValueChange={(value) => updateField('preferences', {
                ...editedUser?.preferences,
                dietary: { ...editedUser?.preferences?.dietary, isVegan: value }
              })}
            />
            <PreferenceToggle
              label="Gluten Free"
              value={editedUser?.preferences?.dietary?.isGlutenFree || false}
              onValueChange={(value) => updateField('preferences', {
                ...editedUser?.preferences,
                dietary: { ...editedUser?.preferences?.dietary, isGlutenFree: value }
              })}
            />
          </ProfileSection>

          {/* Account Actions */}
          <ProfileSection title="Account">
            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenUrl(privacyUrl)}>
              <Text style={styles.actionButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenUrl(termsUrl)}>
              <Text style={styles.actionButtonText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenUrl(supportUrl)}>
              <Text style={styles.actionButtonText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
              <Text style={[styles.actionButtonText, styles.destructiveText]}>Delete Account</Text>
            </TouchableOpacity>
          </ProfileSection>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#666666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#999999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingVertical: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  viewModeContainer: {
    marginBottom: 16,
  },
  viewModeInfo: {
    marginBottom: 16,
  },
  viewModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  viewModeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  viewModeSwitchButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewModeSwitchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  destructiveText: {
    color: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#667eea',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
  },
}); 