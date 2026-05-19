import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type DeleteAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
};

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConfirm(password);
      setPassword('');
    } catch {
      setError('Could not delete account. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>Delete account</Text>
          <Text style={styles.message}>
            Enter your password to permanently delete your account.
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="Account deletion password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel account deletion"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Confirm account deletion"
            >
              <Text style={styles.deleteText}>{loading ? 'Deleting…' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    color: '#fff',
    paddingVertical: 10,
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
