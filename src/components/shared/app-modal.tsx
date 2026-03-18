/**
 * @fileoverview Theme-aware modal primitive for consistent overlay dialogs.
 * @module components/shared/app-modal
 */
import type { PropsWithChildren } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

import { AppText } from './app-text';

/**
 * Props for the AppModal component.
 * @property children - Modal content to render
 * @property visible - Whether the modal is visible
 * @property onClose - Callback fired when modal should close
 * @property title - Optional modal title
 * @property contentStyle - Additional styles for content container
 * @property dismissOnBackdrop - Whether tapping backdrop closes modal (default: true)
 */
type AppModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  contentStyle?: StyleProp<ViewStyle>;
  dismissOnBackdrop?: boolean;
}>;

/**
 * Theme-aware modal primitive for consistent overlay dialogs across the app.
 *
 * Renders content in a centered card with backdrop dimming. Supports
 * dismissing via backdrop tap and integrates with the app's color theme.
 *
 * @param props - Component props
 * @param props.children - Modal content
 * @param props.visible - Visibility state
 * @param props.onClose - Close handler
 * @param props.title - Optional header title
 * @param props.contentStyle - Additional content styles
 * @param props.dismissOnBackdrop - Enable backdrop dismiss (default: true)
 * @returns Themed Modal component
 *
 * @example
 * ```tsx
 * const [visible, setVisible] = useState(false);
 *
 * <AppModal
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   title="Confirm Action"
 * >
 *   <AppText>Are you sure you want to proceed?</AppText>
 *   <AppButton title="Confirm" onPress={handleConfirm} />
 * </AppModal>
 * ```
 */
const AppModal = ({
  children,
  visible,
  onClose,
  title,
  contentStyle,
  dismissOnBackdrop = true,
}: AppModalProps) => {
  const { colors } = useAppTheme();

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            contentStyle,
          ]}>
          {title != null && (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <AppText variant="headline">{title}</AppText>
            </View>
          )}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  body: {
    padding: spacing.lg,
  },
});

export { AppModal };
export type { AppModalProps };

