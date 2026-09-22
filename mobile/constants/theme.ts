// PactoPay Design System — extracted from Breadline HTML wireframes
// Matches the web app's Material Design 3 theme

export const Colors = {
  // Primary
  primary: '#00236f',
  primaryDark: '#001d5e',
  onPrimary: '#ffffff',
  primaryContainer: '#dbe1ff',
  onPrimaryContainer: '#001a41',

  // Secondary
  secondary: '#006c4a',
  secondaryDark: '#006645',
  onSecondary: '#ffffff',
  secondaryContainer: '#8af8c7',
  onSecondaryContainer: '#002114',

  // Tertiary
  tertiary: '#9c4234',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffdad3',
  onTertiaryContainer: '#3b0907',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',

  // Neutrals
  background: '#fdfcff',
  onBackground: '#1b1b1f',
  surface: '#fdfcff',
  onSurface: '#1b1b1f',
  surfaceVariant: '#e2e1ec',
  onSurfaceVariant: '#45464f',
  surfaceDisabled: '#e2e1ec',
  onSurfaceDisabled: '#45464f',

  // Outlines
  outline: '#767680',
  outlineVariant: '#c6c5d0',

  // Special
  inverseSurface: '#303034',
  inverseOnSurface: '#f2f0f4',
  inversePrimary: '#b5c4ff',
  shadow: '#000000',
  scrim: '#000000',

  // Semantic
  success: '#006c4a',
  successLight: '#8af8c7',
  warning: '#7c5800',
  warningLight: '#ffdf9c',
  info: '#0061a4',
  infoLight: '#d1e4ff',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  // Display
  displayLarge: { fontSize: 57, lineHeight: 64, fontFamily: 'SpaceMono_700Bold', letterSpacing: -0.25 },
  displayMedium: { fontSize: 45, lineHeight: 52, fontFamily: 'SpaceMono_700Bold' },
  displaySmall: { fontSize: 36, lineHeight: 44, fontFamily: 'SpaceMono_700Bold' },

  // Headline
  headlineLarge: { fontSize: 32, lineHeight: 40, fontFamily: 'SpaceMono_700Bold' },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontFamily: 'SpaceMono_700Bold' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontFamily: 'SpaceMono_700Bold' },

  // Title
  titleLarge: { fontSize: 22, lineHeight: 28, fontFamily: 'PlusJakartaSans_600SemiBold' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.15 },
  titleSmall: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.1 },

  // Body
  bodyLarge: { fontSize: 16, lineHeight: 24, fontFamily: 'PlusJakartaSans_400Regular', letterSpacing: 0.5 },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans_400Regular', letterSpacing: 0.25 },
  bodySmall: { fontSize: 12, lineHeight: 16, fontFamily: 'PlusJakartaSans_400Regular', letterSpacing: 0.4 },

  // Label
  labelLarge: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, lineHeight: 16, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, lineHeight: 16, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.5 },
} as const;

export const Elevation = {
  none: { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  low: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  medium: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
  high: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
} as const;
