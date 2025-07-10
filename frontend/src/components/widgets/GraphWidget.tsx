/**
 * GraphWidget - Real-time charts with sci-fi styling
 * Supports line, area, and bar charts with historical data visualization
 */

import React, { memo, useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Area, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  AreaElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { WidgetConfig, SensorData, SciFiTheme, GraphWidgetConfig } from '@types';
import { useSensorStore } from '@stores/sensorStore';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  AreaElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GraphWidgetProps {
  widget: GraphWidgetConfig;
  sensorData: SensorData;
  sensorValue: number | null;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<GraphWidgetConfig>) => void;
}

export const GraphWidget: React.FC<GraphWidgetProps> = memo(({
  widget,
  sensorData,
  sensorValue,
  theme,
  onUpdate
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [chartData, setChartData] = useState<any>(null);
  const { getSensorHistory } = useSensorStore();

  const {
    config: {
      chartType = 'line',
      timeRange = 60,
      maxDataPoints = 100,
      showGrid = true,
      showLegend = true,
      smoothLine = true,
      fillArea = false,
      showValues = false,
      yAxisMin,
      yAxisMax,
      animationSpeed = 1000
    },
    range: { min = 0, max = 100 } = {},
    unit = '%'
  } = widget;

  // Get historical data for the sensor
  const historicalData = useMemo(() => {
    const history = getSensorHistory(widget.sensorPath, maxDataPoints);
    
    // Ensure we have at least some data points
    if (history.length === 0 && sensorValue !== null) {
      return [{ timestamp: Date.now(), value: sensorValue }];
    }
    
    return history.slice(-maxDataPoints);
  }, [getSensorHistory, widget.sensorPath, maxDataPoints, sensorValue]);

  // Process data for Chart.js
  const processedChartData = useMemo(() => {
    if (historicalData.length === 0) return null;

    const now = Date.now();
    const timeRangeMs = timeRange * 1000;
    const filteredData = historicalData.filter(
      point => now - point.timestamp <= timeRangeMs
    );

    const labels = filteredData.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    });

    const values = filteredData.map(point => point.value);

    // Create gradient for area charts
    let backgroundGradient;
    if (chartRef.current && (chartType === 'area' || fillArea)) {
      const ctx = chartRef.current.ctx;
      backgroundGradient = ctx.createLinearGradient(0, 0, 0, 400);
      backgroundGradient.addColorStop(0, `${theme.colors.primary}60`);
      backgroundGradient.addColorStop(1, `${theme.colors.primary}10`);
    }

    const dataset = {
      label: widget.title,
      data: values,
      borderColor: theme.colors.primary,
      backgroundColor: chartType === 'area' || fillArea ? backgroundGradient : `${theme.colors.primary}20`,
      borderWidth: 2,
      pointBackgroundColor: theme.colors.accent,
      pointBorderColor: theme.colors.primary,
      pointRadius: chartType === 'line' && values.length > 50 ? 0 : 3,
      pointHoverRadius: 5,
      fill: chartType === 'area' || fillArea,
      tension: smoothLine ? 0.4 : 0,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
    };

    return {
      labels,
      datasets: [dataset]
    };
  }, [historicalData, timeRange, chartType, fillArea, smoothLine, theme, widget.title]);

  // Chart.js options with sci-fi styling
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animationSpeed,
      easing: 'easeInOutQuart' as const
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: theme.colors.text,
          font: {
            family: 'monospace',
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: `${theme.colors.surface}F0`,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            return `Time: ${context[0].label}`;
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: showGrid,
        grid: {
          color: `${theme.colors.border}40`,
          lineWidth: 1
        },
        ticks: {
          color: theme.colors.textSecondary,
          font: {
            family: 'monospace',
            size: 10
          },
          maxTicksLimit: 8
        },
        title: {
          display: false
        }
      },
      y: {
        display: showGrid,
        min: yAxisMin ?? min,
        max: yAxisMax ?? max,
        grid: {
          color: `${theme.colors.border}40`,
          lineWidth: 1
        },
        ticks: {
          color: theme.colors.textSecondary,
          font: {
            family: 'monospace',
            size: 10
          },
          callback: function(value: any) {
            return `${value}${unit}`;
          }
        },
        title: {
          display: true,
          text: unit,
          color: theme.colors.textSecondary,
          font: {
            family: 'monospace',
            size: 10
          }
        }
      }
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  }), [
    showGrid, 
    showLegend, 
    theme, 
    unit, 
    yAxisMin, 
    yAxisMax, 
    min, 
    max, 
    animationSpeed
  ]);

  // Update chart data when new sensor data arrives
  useEffect(() => {
    if (processedChartData) {
      setChartData(processedChartData);
    }
  }, [processedChartData]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const renderChart = () => {
    if (!chartData) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textSecondary,
            fontSize: '14px'
          }}
        >
          Waiting for data...
        </div>
      );
    }

    const ChartComponent = {
      line: Line,
      area: Area,
      bar: Bar
    }[chartType] || Line;

    return (
      <ChartComponent
        ref={chartRef}
        data={chartData}
        options={chartOptions}
      />
    );
  };

  return (
    <motion.div
      className="graph-widget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chart container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          minHeight: 200
        }}
      >
        {renderChart()}
      </div>

      {/* Current value display */}
      {showValues && sensorValue !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 8,
            padding: '8px 12px',
            backgroundColor: `${theme.colors.surface}80`,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ 
            fontSize: '12px', 
            color: theme.colors.textSecondary 
          }}>
            Current:
          </span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: theme.colors.primary,
            fontFamily: 'monospace'
          }}>
            {sensorValue.toFixed(1)}{unit}
          </span>
        </motion.div>
      )}

      {/* Data points indicator */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: '10px',
          color: theme.colors.textSecondary,
          backgroundColor: `${theme.colors.surface}CC`,
          padding: '2px 6px',
          borderRadius: 4,
          border: `1px solid ${theme.colors.border}50`
        }}
      >
        {historicalData.length} pts
      </div>

      {/* Real-time indicator */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: sensorValue !== null ? theme.colors.success : theme.colors.muted,
          boxShadow: `0 0 8px ${sensorValue !== null ? theme.colors.success : theme.colors.muted}`
        }}
      />
    </motion.div>
  );
});

GraphWidget.displayName = 'GraphWidget';

export default GraphWidget;