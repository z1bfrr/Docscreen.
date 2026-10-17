import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { colors, fonts, spacing, rounded } from '../theme';
import { X } from 'lucide-react-native';

interface ActionPromptProps {
  visible: boolean;
  icon: React.ReactNode;
  headline: string;
  body: string;
  primaryActionText: string;
  onPrimaryAction: () => void;
  onClose: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export function ActionPrompt({
  visible,
  icon,
  headline,
  body,
  primaryActionText,
  onPrimaryAction,
  onClose,
  secondaryActionText,
  onSecondaryAction
}: ActionPromptProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.promptCard}>
          
          {/* Easy Exit (Rule #2) */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X color={colors.slate500} size={20} />
          </TouchableOpacity>

          {/* Micro-Graphic (Rule #1) */}
          <View style={styles.iconWrap}>
            {icon}
          </View>

          {/* Visual Hierarchy (Rule #1) & Single-Sentence Headline (Rule #2) */}
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.body}>{body}</Text>

          <View style={styles.actionContainer}>
            {/* Clear Tap Targets & Action-Oriented Buttons (Rule #1 & #2) */}
            <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryAction}>
              <Text style={styles.primaryBtnText}>{primaryActionText}</Text>
            </TouchableOpacity>
            
            {secondaryActionText && onSecondaryAction && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondaryAction}>
                <Text style={styles.secondaryBtnText}>{secondaryActionText}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // DeepSlate with opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.gutter,
  },
  promptCard: {
    width: width - spacing.gutter * 2,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.gutter,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sapphireLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  headline: {
    ...fonts.headlineSm,
    color: colors.deepSlate,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    ...fonts.bodyMd,
    color: colors.slate500,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: colors.sapphire,
    borderRadius: rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    ...fonts.labelLg,
    color: colors.onPrimary,
  },
  secondaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...fonts.labelLg,
    color: colors.slate500,
  }
});
