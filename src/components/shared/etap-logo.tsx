/**
 * @fileoverview ETAP brand logo component.
 * @module components/shared/etap-logo
 */
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type EtapLogoProps = {
  size?: 'sm' | 'md' | 'lg';
};

/**
 * ETAP brand logo rendered as styled text.
 *
 * @param props - Component props
 * @param props.size - Logo size variant (defaults to 'md')
 * @returns Styled ETAP logo
 */
const EtapLogo = ({ size = 'md' }: EtapLogoProps) => {
  const sizeStyles = {
    sm: { height: 40, width: 116 },
    md: { height: 52, width: 152 },
    lg: { height: 64, width: 188 },
  };

  return (
    <Image
      contentFit="contain"
      source={require('../../../assets/images/etap-logo.png')}
      style={[styles.logo, sizeStyles[size]]}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'flex-start',
  },
});

export { EtapLogo };
