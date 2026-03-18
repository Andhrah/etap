/**
 * @fileoverview 404 fallback screen for unmatched routes.
 * @module app/+not-found
 */
import { Link, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/** Home route typed for Link component */
const homeHref = '/' as Href;

import { AppLayout } from '@components/shared/app-layout';
import { AppText } from '@components/shared/app-text';

/**
 * Fallback route rendered by Expo Router when a requested screen is missing.
 *
 * Provides a user-friendly error state with navigation back to the home screen.
 * Expo Router automatically renders this component for any unmatched routes.
 *
 * @returns Not found screen with home navigation link
 */
const NotFoundScreen = () => {
  return (
    <AppLayout contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <AppText variant="headline">Screen not found</AppText>
        <AppText variant="body" tone="muted" style={styles.copy}>
          The route does not exist in the current scaffold.
        </AppText>
        <Link href={homeHref} style={styles.link}>
          <AppText variant="label">Return to home</AppText>
        </Link>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 12,
  },
  copy: {
    maxWidth: 320,
  },
  link: {
    marginTop: 8,
  },
});

export default NotFoundScreen;
