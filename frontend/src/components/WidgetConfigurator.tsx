/**
 * WidgetConfigurator - Dynamic widget configuration modal with React Hook Form + Zod
 * Type-safe form handling with live preview and sci-fi theming
 */

import React, { memo, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider, useController, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WidgetConfig, WidgetType, SensorData } from '@types';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import SciFiFrame from './sci-fi/SciFiFrame';
import { 
  widgetSchema, 
  getWidgetSchema, 
  defaultConfigs,
  validateWidgetConfig 
} from '@utils/validationSchemas';
import { useWidgetStore } from '@stores/widgetStore';

interface WidgetConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  editingWidget?: WidgetConfig | null;
  initialPosition?: { x: number; y: number };
  sensorData?: SensorData;
}

interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'range' | 'color';
  options?: string[] | { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = memo(({
  name,
  label,
  type,
  options,
  min,
  max,
  step,
  placeholder,
  description
}) => {
  const { currentTheme } = useSciFiTheme();
  const { control, formState: { errors } } = useFormContext();
  
  const { field } = useController({
    name,
    control,
    defaultValue: type === 'checkbox' ? false : type === 'number' ? 0 : ''
  });

  const fieldError = name.split('.').reduce((acc, key) => acc?.[key], errors);
  const hasError = !!fieldError;

  const baseInputStyle = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: currentTheme.colors.surface,
    border: `1px solid ${hasError ? currentTheme.colors.danger : currentTheme.colors.border}`,
    borderRadius: currentTheme.effects.borderRadius,
    color: currentTheme.colors.text,
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const focusStyle = {
    borderColor: currentTheme.colors.primary,
    boxShadow: `0 0 8px ${currentTheme.colors.primary}40`
  };

  const renderInput = () => {
    switch (type) {
      case 'checkbox':
        return (
          <motion.label
            whileHover={{ scale: 1.02 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              style={{
                accentColor: currentTheme.colors.primary,
                transform: 'scale(1.2)'
              }}
            />
            <span style={{ color: currentTheme.colors.text, fontSize: '13px' }}>
              {label}
            </span>
          </motion.label>
        );

      case 'select':
        return (
          <select
            {...field}
            style={{
              ...baseInputStyle,
              cursor: 'pointer',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(currentTheme.colors.textSecondary)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px'
            }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, baseInputStyle)}
          >
            {options?.map(option => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        );

      case 'range':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              {...field}
              style={{
                flex: 1,
                accentColor: currentTheme.colors.primary,
                height: '4px',
                borderRadius: '2px'
              }}
            />
            <span style={{
              color: currentTheme.colors.textSecondary,
              fontSize: '12px',
              minWidth: '40px',
              textAlign: 'right'
            }}>
              {field.value}
            </span>
          </div>
        );

      case 'color':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              {...field}
              style={{
                width: '40px',
                height: '32px',
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.effects.borderRadius,
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={field.value}
              onChange={field.onChange}
              placeholder="#000000"
              style={{
                ...baseInputStyle,
                flex: 1,
                fontFamily: 'monospace'
              }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, baseInputStyle)}
            />
          </div>
        );

      default:
        return (
          <input
            type={type}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            {...field}
            style={baseInputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, baseInputStyle)}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div style={{ marginBottom: '16px' }}>
        {renderInput()}
        {description && (
          <p style={{
            color: currentTheme.colors.textSecondary,
            fontSize: '11px',
            marginTop: '4px',
            marginBottom: 0
          }}>
            {description}
          </p>
        )}
        {hasError && (
          <p style={{
            color: currentTheme.colors.danger,
            fontSize: '11px',
            marginTop: '4px',
            marginBottom: 0
          }}>
            {fieldError?.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        color: currentTheme.colors.text,
        fontSize: '13px',
        fontWeight: 500,
        marginBottom: '6px'
      }}>
        {label}
      </label>
      {renderInput()}
      {description && (
        <p style={{
          color: currentTheme.colors.textSecondary,
          fontSize: '11px',
          marginTop: '4px',
          marginBottom: 0
        }}>
          {description}
        </p>
      )}
      {hasError && (
        <p style={{
          color: currentTheme.colors.danger,
          fontSize: '11px',
          marginTop: '4px',
          marginBottom: 0
        }}>
          {fieldError?.message}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export const WidgetConfigurator: React.FC<WidgetConfiguratorProps> = memo(({
  isOpen,
  onClose,
  editingWidget,
  initialPosition,
  sensorData
}) => {
  const { currentTheme } = useSciFiTheme();
  const { addWidget, updateWidget } = useWidgetStore();
  const [selectedType, setSelectedType] = useState<WidgetType>('simple');
  const [previewData, setPreviewData] = useState<any>(null);

  // Get default values based on widget type and editing state
  const defaultValues = useMemo(() => {
    if (editingWidget) {
      return editingWidget;
    }

    return {
      type: selectedType,
      title: `New ${selectedType} Widget`,
      sensorPath: 'CPU/Temperature/Core1',
      position: initialPosition || { x: 0, y: 0 },
      size: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      theme: currentTheme.id,
      range: { min: 0, max: 100 },
      unit: selectedType === 'simple' ? '°C' : '%',
      alerts: [],
      config: defaultConfigs[selectedType],
      ...(selectedType === 'multi-resource' ? { resources: [] } : {})
    };
  }, [selectedType, editingWidget, initialPosition, currentTheme.id]);

  // Dynamic schema based on selected type
  const currentSchema = useMemo(() => {
    return getWidgetSchema(selectedType);
  }, [selectedType]);

  const methods = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues,
    mode: 'onChange'
  });

  const { handleSubmit, watch, reset, formState: { isValid, errors } } = methods;

  // Watch all form values for live preview
  const watchedValues = watch();

  // Update preview data when form values change
  useEffect(() => {
    if (isValid) {
      setPreviewData(watchedValues);
    }
  }, [watchedValues, isValid]);

  // Reset form when widget type changes
  useEffect(() => {
    if (!editingWidget) {
      const newDefaults = {
        ...defaultValues,
        type: selectedType,
        config: defaultConfigs[selectedType],
        ...(selectedType === 'multi-resource' ? { resources: [] } : {})
      };
      reset(newDefaults);
    }
  }, [selectedType, reset, defaultValues, editingWidget]);

  const onSubmit = (data: any) => {
    try {
      const validatedData = validateWidgetConfig(data);
      if ('success' in validatedData && !validatedData.success) {
        console.error('Validation errors:', validatedData.errors);
        return;
      }

      if (editingWidget) {
        updateWidget(editingWidget.id, validatedData as WidgetConfig);
      } else {
        addWidget(validatedData as WidgetConfig);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving widget:', error);
    }
  };

  const widgetTypeOptions = [
    { value: 'simple', label: 'Simple Display' },
    { value: 'gauge', label: 'Gauge/Arc' },
    { value: 'graph', label: 'Real-time Graph' },
    { value: 'meter', label: 'Progress Meter' },
    { value: 'multi-resource', label: 'Multi Resource' }
  ];

  const renderConfigFields = () => {
    const fields: FormFieldProps[] = [];

    // Base fields for all widgets
    fields.push(
      { name: 'title', label: 'Widget Title', type: 'text', placeholder: 'Enter widget title' },
      { name: 'sensorPath', label: 'Sensor Path', type: 'text', placeholder: 'CPU/Temperature/Core1' },
      { name: 'unit', label: 'Unit', type: 'text', placeholder: '°C, %, RPM, etc.' },
      { name: 'range.min', label: 'Minimum Value', type: 'number' },
      { name: 'range.max', label: 'Maximum Value', type: 'number' }
    );

    // Type-specific configuration fields
    switch (selectedType) {
      case 'gauge':
        fields.push(
          { name: 'config.gaugeType', label: 'Gauge Type', type: 'select', options: ['arc', 'circle', 'linear'] },
          { name: 'config.startAngle', label: 'Start Angle', type: 'range', min: -180, max: 180 },
          { name: 'config.endAngle', label: 'End Angle', type: 'range', min: -180, max: 180 },
          { name: 'config.thickness', label: 'Thickness', type: 'range', min: 5, max: 50 },
          { name: 'config.showValue', label: 'Show Value', type: 'checkbox' },
          { name: 'config.showMinMax', label: 'Show Min/Max', type: 'checkbox' },
          { name: 'config.animated', label: 'Animated', type: 'checkbox' },
          { name: 'config.glowEffect', label: 'Glow Effect', type: 'checkbox' }
        );
        break;

      case 'graph':
        fields.push(
          { name: 'config.chartType', label: 'Chart Type', type: 'select', options: ['line', 'area', 'bar'] },
          { name: 'config.timeRange', label: 'Time Range (seconds)', type: 'range', min: 10, max: 3600 },
          { name: 'config.maxDataPoints', label: 'Max Data Points', type: 'range', min: 10, max: 1000 },
          { name: 'config.showGrid', label: 'Show Grid', type: 'checkbox' },
          { name: 'config.showLegend', label: 'Show Legend', type: 'checkbox' },
          { name: 'config.smoothLine', label: 'Smooth Line', type: 'checkbox' },
          { name: 'config.fillArea', label: 'Fill Area', type: 'checkbox' }
        );
        break;

      case 'simple':
        fields.push(
          { name: 'config.displayMode', label: 'Display Mode', type: 'select', options: ['compact', 'medium', 'large', 'xl'] },
          { name: 'config.showLabel', label: 'Show Label', type: 'checkbox' },
          { name: 'config.showUnit', label: 'Show Unit', type: 'checkbox' },
          { name: 'config.showTrend', label: 'Show Trend', type: 'checkbox' },
          { name: 'config.precision', label: 'Decimal Places', type: 'range', min: 0, max: 5 },
          { name: 'config.textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
          { name: 'config.glowEffect', label: 'Glow Effect', type: 'checkbox' },
          { name: 'config.pulseOnChange', label: 'Pulse on Change', type: 'checkbox' }
        );
        break;

      case 'meter':
        fields.push(
          { name: 'config.meterType', label: 'Meter Type', type: 'select', options: ['horizontal', 'vertical', 'circular'] },
          { name: 'config.showValue', label: 'Show Value', type: 'checkbox' },
          { name: 'config.showMarkers', label: 'Show Markers', type: 'checkbox' },
          { name: 'config.showThresholds', label: 'Show Thresholds', type: 'checkbox' },
          { name: 'config.segments', label: 'Segments', type: 'range', min: 1, max: 50 },
          { name: 'config.thickness', label: 'Thickness', type: 'range', min: 5, max: 100 },
          { name: 'config.glowEffect', label: 'Glow Effect', type: 'checkbox' }
        );
        break;

      case 'multi-resource':
        fields.push(
          { name: 'config.displayMode', label: 'Display Mode', type: 'select', options: ['grid', 'list'] },
          { name: 'config.showLabels', label: 'Show Labels', type: 'checkbox' },
          { name: 'config.showValues', label: 'Show Values', type: 'checkbox' },
          { name: 'config.showBars', label: 'Show Progress Bars', type: 'checkbox' },
          { name: 'config.maxItems', label: 'Max Items', type: 'range', min: 1, max: 20 },
          { name: 'config.sortBy', label: 'Sort By', type: 'select', options: ['name', 'value', 'status'] },
          { name: 'config.sortDirection', label: 'Sort Direction', type: 'select', options: ['asc', 'desc'] },
          { name: 'config.colorCoding', label: 'Color Coding', type: 'checkbox' }
        );
        break;
    }

    return fields.map((field, index) => (
      <FormField key={`${selectedType}-${field.name}-${index}`} {...field} />
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${currentTheme.colors.background}80`,
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              display: 'flex',
              gap: '20px',
              overflow: 'hidden'
            }}
          >
            {/* Form Panel */}
            <SciFiFrame
              frameType="angular"
              cornerCuts={[8, 8, 8, 8]}
              style={{
                flex: 1,
                backgroundColor: currentTheme.colors.surface,
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                padding: '20px',
                borderBottom: `1px solid ${currentTheme.colors.border}`,
                backgroundColor: `${currentTheme.colors.primary}10`
              }}>
                <h2 style={{
                  margin: 0,
                  color: currentTheme.colors.text,
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  {editingWidget ? 'Edit Widget' : 'Create Widget'}
                </h2>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Widget Type Selector */}
                    {!editingWidget && (
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{
                          display: 'block',
                          color: currentTheme.colors.text,
                          fontSize: '13px',
                          fontWeight: 500,
                          marginBottom: '8px'
                        }}>
                          Widget Type
                        </label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '8px'
                        }}>
                          {widgetTypeOptions.map(option => (
                            <motion.button
                              key={option.value}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedType(option.value as WidgetType)}
                              style={{
                                padding: '12px',
                                border: `1px solid ${selectedType === option.value ? currentTheme.colors.primary : currentTheme.colors.border}`,
                                borderRadius: currentTheme.effects.borderRadius,
                                backgroundColor: selectedType === option.value 
                                  ? `${currentTheme.colors.primary}20` 
                                  : currentTheme.colors.surface,
                                color: currentTheme.colors.text,
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Configuration Fields */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '16px'
                    }}>
                      {renderConfigFields()}
                    </div>

                    {/* Form Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '24px',
                      paddingTop: '20px',
                      borderTop: `1px solid ${currentTheme.colors.border}`
                    }}>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          border: `1px solid ${currentTheme.colors.border}`,
                          borderRadius: currentTheme.effects.borderRadius,
                          backgroundColor: 'transparent',
                          color: currentTheme.colors.text,
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isValid}
                        style={{
                          flex: 2,
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: currentTheme.effects.borderRadius,
                          backgroundColor: isValid ? currentTheme.colors.primary : currentTheme.colors.muted,
                          color: currentTheme.colors.text,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isValid ? 'pointer' : 'not-allowed',
                          boxShadow: isValid ? `0 0 12px ${currentTheme.colors.primary}40` : 'none'
                        }}
                      >
                        {editingWidget ? 'Update Widget' : 'Create Widget'}
                      </motion.button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </SciFiFrame>

            {/* Live Preview Panel */}
            <SciFiFrame
              frameType="rounded"
              cornerCuts={[12, 12, 12, 12]}
              style={{
                width: '300px',
                backgroundColor: currentTheme.colors.surface,
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                padding: '16px',
                borderBottom: `1px solid ${currentTheme.colors.border}`,
                backgroundColor: `${currentTheme.colors.accent}10`
              }}>
                <h3 style={{
                  margin: 0,
                  color: currentTheme.colors.text,
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  Live Preview
                </h3>
              </div>

              <div style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isValid && previewData ? (
                  <div style={{
                    width: '200px',
                    height: '150px',
                    border: `1px solid ${currentTheme.colors.border}`,
                    borderRadius: currentTheme.effects.borderRadius,
                    backgroundColor: `${currentTheme.colors.background}80`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentTheme.colors.textSecondary,
                    fontSize: '12px'
                  }}>
                    Widget Preview
                    <br />
                    ({selectedType})
                  </div>
                ) : (
                  <div style={{
                    color: currentTheme.colors.textSecondary,
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    Configure widget to see preview
                  </div>
                )}
              </div>
            </SciFiFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

WidgetConfigurator.displayName = 'WidgetConfigurator';
export default WidgetConfigurator;