import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <React.Fragment key={step}>
            {index > 0 && (
              <View style={[styles.line, isCompleted && styles.lineCompleted]} />
            )}
            <View style={styles.stepWrapper}>
              <View style={[styles.circle, isActive && styles.circleActive, isCompleted && styles.circleCompleted]}>
                <Text style={[styles.circleText, isActive && styles.circleTextActive, isCompleted && styles.circleTextCompleted]}>
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {step}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  stepWrapper: { alignItems: 'center', width: 64 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  circleActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  circleCompleted: { borderColor: Colors.secondary, backgroundColor: Colors.secondary },
  circleText: { ...Typography.labelMedium, color: Colors.outline },
  circleTextActive: { color: Colors.onPrimary },
  circleTextCompleted: { color: Colors.onPrimary },
  label: { ...Typography.labelSmall, color: Colors.outline, marginTop: 4, textAlign: 'center' },
  labelActive: { color: Colors.primary },
  line: { flex: 1, height: 2, backgroundColor: Colors.outlineVariant, marginBottom: 20 },
  lineCompleted: { backgroundColor: Colors.secondary },
});
