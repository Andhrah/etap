/**
 * @fileoverview Reusable draggable bottom sheet surface.
 * @module components/shared/app-bottom-sheet
 */
import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius } from '@theme/tokens';

type AppBottomSheetProps = PropsWithChildren<{
  backgroundColor: string;
  borderColor: string;
  closeButtonBackgroundColor?: string;
  closeButtonIconColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  initialHeight: number;
  initialSnapRatio?: number;
  maxHeight: number;
  maxWidth?: number;
  minSnapHeight?: number;
  onClose?: () => void;
  shadowColor?: string;
  style?: StyleProp<ViewStyle>;
}>;

const HANDLE_ZONE_HEIGHT = 32;

/**
 * Bottom-anchored sheet that can expand when its content exceeds the collapsed height.
 */
const AppBottomSheet = ({
  backgroundColor,
  borderColor,
  closeButtonBackgroundColor = 'rgba(37, 13, 75, 0.08)',
  closeButtonIconColor = 'rgba(30, 22, 48, 0.68)',
  children,
  contentContainerStyle,
  initialHeight,
  initialSnapRatio = 0.55,
  maxHeight,
  maxWidth,
  minSnapHeight,
  onClose,
  shadowColor = '#1E1630',
  style,
}: AppBottomSheetProps) => {
  const contentHeightRef = useRef(0);
  const currentHeightRef = useRef(initialHeight);
  const dragStartHeightRef = useRef(initialHeight);
  const animatedHeight = useRef(new Animated.Value(initialHeight)).current;
  const [snapPoint, setSnapPoint] = useState<'peek' | 'resting' | 'expanded'>('resting');
  const resolvedMinSnapHeight = minSnapHeight ?? initialHeight;

  const getSheetHeights = () => {
    const peekHeight = Math.min(maxHeight, resolvedMinSnapHeight);
    const restingFloorHeight = Math.min(maxHeight, Math.max(peekHeight, initialHeight));

    if (contentHeightRef.current <= 0) {
      const fallbackHeight = restingFloorHeight;

      return {
        expandedHeight: fallbackHeight,
        peekHeight,
        restingHeight: fallbackHeight,
      };
    }

    const expandedHeight = Math.min(
      maxHeight,
      Math.max(peekHeight, contentHeightRef.current + HANDLE_ZONE_HEIGHT),
    );
    const restingHeight = Math.min(
      expandedHeight,
      Math.max(
        restingFloorHeight,
        contentHeightRef.current * initialSnapRatio + HANDLE_ZONE_HEIGHT,
      ),
    );

    return {
      expandedHeight,
      peekHeight,
      restingHeight,
    };
  };

  const syncSheetHeight = (
    nextHeight: number,
    nextSnapPoint: 'peek' | 'resting' | 'expanded',
    animated = true,
  ) => {
    currentHeightRef.current = nextHeight;
    setSnapPoint(nextSnapPoint);

    if (!animated) {
      animatedHeight.setValue(nextHeight);
      return;
    }

    Animated.spring(animatedHeight, {
      bounciness: 0,
      speed: 18,
      toValue: nextHeight,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const { expandedHeight, peekHeight, restingHeight } = getSheetHeights();
    const nextHeight =
      snapPoint === 'expanded'
        ? expandedHeight
        : snapPoint === 'peek'
          ? peekHeight
          : restingHeight;

    syncSheetHeight(nextHeight, snapPoint, false);
  }, [initialHeight, maxHeight, minSnapHeight, snapPoint]);

  const handleContentSizeChange = (_: number, contentHeight: number) => {
    contentHeightRef.current = contentHeight;
    const { expandedHeight, peekHeight, restingHeight } = getSheetHeights();
    const nextHeight =
      snapPoint === 'expanded'
        ? expandedHeight
        : snapPoint === 'peek'
          ? peekHeight
          : restingHeight;

    syncSheetHeight(nextHeight, snapPoint, false);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { expandedHeight, peekHeight, restingHeight } = getSheetHeights();

          return (
            (expandedHeight > restingHeight || restingHeight > peekHeight) &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
            Math.abs(gestureState.dy) > 2
          );
        },
        onPanResponderGrant: () => {
          dragStartHeightRef.current = currentHeightRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const { expandedHeight, peekHeight } = getSheetHeights();
          const nextHeight = Math.max(
            peekHeight,
            Math.min(expandedHeight, dragStartHeightRef.current - gestureState.dy),
          );

          currentHeightRef.current = nextHeight;
          animatedHeight.setValue(nextHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { expandedHeight, peekHeight, restingHeight } = getSheetHeights();

          if (expandedHeight <= restingHeight && restingHeight <= peekHeight) {
            syncSheetHeight(peekHeight, 'peek');
            return;
          }

          const peekMidpoint = (peekHeight + restingHeight) / 2;
          const expandedMidpoint = (restingHeight + expandedHeight) / 2;
          const currentHeight = currentHeightRef.current;

          if (gestureState.vy <= -0.2) {
            if (currentHeight >= expandedMidpoint) {
              syncSheetHeight(expandedHeight, 'expanded');
              return;
            }

            syncSheetHeight(restingHeight, 'resting');
            return;
          }

          if (gestureState.vy >= 0.2) {
            if (currentHeight <= peekMidpoint) {
              syncSheetHeight(peekHeight, 'peek');
              return;
            }

            syncSheetHeight(restingHeight, 'resting');
            return;
          }

          if (currentHeight <= peekMidpoint) {
            syncSheetHeight(peekHeight, 'peek');
            return;
          }

          if (currentHeight >= expandedMidpoint) {
            syncSheetHeight(expandedHeight, 'expanded');
            return;
          }

          syncSheetHeight(restingHeight, 'resting');
        },
        onPanResponderTerminate: () => {
          const { expandedHeight, peekHeight, restingHeight } = getSheetHeights();
          const currentHeight = currentHeightRef.current;
          const distances = [
            { height: peekHeight, snap: 'peek' as const },
            { height: restingHeight, snap: 'resting' as const },
            { height: expandedHeight, snap: 'expanded' as const },
          ];
          const nearest = distances.reduce((closest, candidate) =>
            Math.abs(candidate.height - currentHeight) < Math.abs(closest.height - currentHeight)
              ? candidate
              : closest,
          );

          syncSheetHeight(nearest.height, nearest.snap);
        },
      }),
    [initialHeight, initialSnapRatio, maxHeight, minSnapHeight],
  );

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor,
            borderColor,
            height: animatedHeight,
            maxWidth,
            shadowColor,
          },
          style,
        ]}>
        <View style={styles.handleZone} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {onClose != null && (
          <Pressable
            accessibilityLabel="Close bottom sheet"
            hitSlop={10}
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: closeButtonBackgroundColor,
              },
            ]}>
            <Ionicons color={closeButtonIconColor} name="close" size={22} />
          </Pressable>
        )}

        <ScrollView
          bounces={false}
          contentContainerStyle={contentContainerStyle}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={snapPoint === 'expanded'}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: 14,
    width: 36,
    zIndex: 2,
  },
  handle: {
    backgroundColor: 'rgba(30, 22, 48, 0.16)',
    borderRadius: radius.pill,
    height: 4,
    width: 36,
  },
  handleZone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HANDLE_ZONE_HEIGHT,
  },
  host: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignSelf: 'center',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    width: '100%',
    elevation: 6,
  },
});

export { AppBottomSheet };
export type { AppBottomSheetProps };
