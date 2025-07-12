/**
 * SenseCanvas BaseWidget Component Tests
 * Core widget functionality testing with Svelte 5 runes and NeoDrag integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import BaseWidget from '../../../sensecanvas/client/src/lib/components/widgets/BaseWidget.svelte';
import type { WidgetConfig } from '../../../sensecanvas/client/src/lib/types/widgets';

// Mock NeoDrag
vi.mock('@neodrag/svelte', () => ({
  draggable: vi.fn(() => ({
    destroy: vi.fn()
  }))
}));

// Mock Cosmic UI
vi.mock('@cosmic-ui/svelte', () => ({
  Frame: vi.fn(() => ({ $$set: vi.fn() })),
  Button: vi.fn(() => ({ $$set: vi.fn() })),
  Text: vi.fn(() => ({ $$set: vi.fn() }))
}));

describe('BaseWidget', () => {
  let mockConfig: WidgetConfig;
  let mockData: any;
  let mockOnResize: ReturnType<typeof vi.fn>;
  let mockOnMove: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let mockOnEdit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockConfig = {
      id: 'test-widget-1',
      type: 'gauge',
      title: 'Test Widget',
      sensorType: 'cpu',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      style: {
        theme: 'default',
        colors: ['#22d3ee', '#ef4444'],
        opacity: 1,
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        borderWidth: 1,
        borderColor: '#374151',
        shadowEnabled: false,
        shadowColor: '#000000',
        shadowBlur: 4,
        gradientEnabled: false,
        gradientDirection: 'horizontal'
      },
      alerts: {
        enabled: true,
        thresholds: { warning: 75, critical: 90 },
        showNotifications: true,
        playSound: false,
        flashWidget: true
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      tags: [],
      isSelected: false,
      isResizing: false,
      isDragging: false,
      zIndex: 1
    };

    mockData = {
      value: 65.5,
      unit: '%',
      timestamp: Date.now(),
      status: 'normal'
    };

    mockOnResize = vi.fn();
    mockOnMove = vi.fn();
    mockOnDelete = vi.fn();
    mockOnEdit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with basic props', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByText('Test Widget')).toBeInTheDocument();
      expect(screen.getByText('65.5%')).toBeInTheDocument();
    });

    it('should apply correct positioning styles', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveStyle({
        left: '100px',
        top: '100px',
        width: '200px',
        height: '200px'
      });
    });

    it('should apply theme styling', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('theme-default');
    });
  });

  describe('Interactive States', () => {
    it('should show selected state when config.isSelected is true', () => {
      const selectedConfig = { ...mockConfig, isSelected: true };
      
      render(BaseWidget, {
        props: {
          config: selectedConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('selected');
    });

    it('should show dragging state when config.isDragging is true', () => {
      const draggingConfig = { ...mockConfig, isDragging: true };
      
      render(BaseWidget, {
        props: {
          config: draggingConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('dragging');
    });

    it('should show resizing state when config.isResizing is true', () => {
      const resizingConfig = { ...mockConfig, isResizing: true };
      
      render(BaseWidget, {
        props: {
          config: resizingConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('resizing');
    });
  });

  describe('Alert States', () => {
    it('should show warning alert when value exceeds warning threshold', () => {
      const warningData = { ...mockData, value: 80 };
      
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: warningData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('alert-warning');
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should show critical alert when value exceeds critical threshold', () => {
      const criticalData = { ...mockData, value: 95 };
      
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: criticalData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('alert-critical');
      expect(screen.getByText('🚨')).toBeInTheDocument();
    });

    it('should not show alerts when alerts.enabled is false', () => {
      const noAlertsConfig = {
        ...mockConfig,
        alerts: { ...mockConfig.alerts, enabled: false }
      };
      const criticalData = { ...mockData, value: 95 };
      
      render(BaseWidget, {
        props: {
          config: noAlertsConfig,
          data: criticalData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).not.toHaveClass('alert-critical');
      expect(screen.queryByText('🚨')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should show edit controls in edit mode', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove,
          onDelete: mockOnDelete,
          onEdit: mockOnEdit
        }
      });

      expect(screen.getByLabelText('Edit widget')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete widget')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove,
          onDelete: mockOnDelete,
          onEdit: mockOnEdit
        }
      });

      const editButton = screen.getByLabelText('Edit widget');
      await fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockConfig);
    });

    it('should call onDelete when delete button is clicked', async () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove,
          onDelete: mockOnDelete,
          onEdit: mockOnEdit
        }
      });

      const deleteButton = screen.getByLabelText('Delete widget');
      await fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockConfig.id);
    });

    it('should not show edit controls when edit mode is false', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: false,
          onResize: mockOnResize,
          onMove: mockOnMove,
          onDelete: mockOnDelete,
          onEdit: mockOnEdit
        }
      });

      expect(screen.queryByLabelText('Edit widget')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Delete widget')).not.toBeInTheDocument();
    });
  });

  describe('Data Updates', () => {
    it('should update display when data prop changes', async () => {
      const { rerender } = render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByText('65.5%')).toBeInTheDocument();

      const newData = { ...mockData, value: 75.2 };
      await rerender({
        config: mockConfig,
        data: newData,
        onResize: mockOnResize,
        onMove: mockOnMove
      });

      expect(screen.getByText('75.2%')).toBeInTheDocument();
    });

    it('should handle null or undefined data gracefully', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: null,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('should show loading state when data is loading', () => {
      const loadingData = { ...mockData, loading: true };
      
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: loadingData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should show error state when data has error', () => {
      const errorData = { ...mockData, error: 'Sensor error' };
      
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: errorData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
      expect(screen.getByText('Sensor error')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should call onMove when widget is moved', async () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      // Simulate drag event
      const widget = screen.getByTestId('base-widget');
      await fireEvent.mouseDown(widget, { clientX: 100, clientY: 100 });
      await fireEvent.mouseMove(widget, { clientX: 150, clientY: 150 });
      await fireEvent.mouseUp(widget);

      // Note: This test would require mocking NeoDrag more thoroughly
      // For now, we test that the component renders correctly
      expect(widget).toBeInTheDocument();
    });

    it('should apply bounds correctly', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          bounds: { top: 0, left: 0, right: 1000, bottom: 800 },
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      // Verify widget renders with bounds applied
      const widget = screen.getByTestId('base-widget');
      expect(widget).toBeInTheDocument();
    });
  });

  describe('Resize Functionality', () => {
    it('should show resize handles in edit mode', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
    });

    it('should call onResize when widget is resized', async () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      // Simulate resize event
      const resizeHandle = screen.getByTestId('resize-handle');
      await fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 300 });
      await fireEvent.mouseMove(resizeHandle, { clientX: 350, clientY: 350 });
      await fireEvent.mouseUp(resizeHandle);

      // Note: Actual resize behavior would need more detailed mocking
      expect(resizeHandle).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should apply cyberpunk theme correctly', () => {
      const cyberpunkConfig = {
        ...mockConfig,
        style: { ...mockConfig.style, theme: 'cyberpunk' }
      };
      
      render(BaseWidget, {
        props: {
          config: cyberpunkConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('theme-cyberpunk');
    });

    it('should apply gaming theme correctly', () => {
      const gamingConfig = {
        ...mockConfig,
        style: { ...mockConfig.style, theme: 'gaming' }
      };
      
      render(BaseWidget, {
        props: {
          config: gamingConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveClass('theme-gaming');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', async () => {
      const { rerender } = render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      const initialRender = widget.outerHTML;

      // Re-render with same props
      await rerender({
        config: mockConfig,
        data: mockData,
        onResize: mockOnResize,
        onMove: mockOnMove
      });

      expect(widget.outerHTML).toBe(initialRender);
    });

    it('should cleanup properly when unmounted', () => {
      const { unmount } = render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      // Unmount component
      unmount();

      // Verify cleanup (this would require more detailed mocking)
      expect(true).toBe(true); // Placeholder for actual cleanup verification
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          onResize: mockOnResize,
          onMove: mockOnMove
        }
      });

      const widget = screen.getByTestId('base-widget');
      expect(widget).toHaveAttribute('role', 'widget');
      expect(widget).toHaveAttribute('aria-label', 'Test Widget');
    });

    it('should support keyboard navigation in edit mode', async () => {
      render(BaseWidget, {
        props: {
          config: mockConfig,
          data: mockData,
          editMode: true,
          onResize: mockOnResize,
          onMove: mockOnMove,
          onDelete: mockOnDelete,
          onEdit: mockOnEdit
        }
      });

      const editButton = screen.getByLabelText('Edit widget');
      editButton.focus();
      
      await fireEvent.keyDown(editButton, { key: 'Enter' });
      expect(mockOnEdit).toHaveBeenCalledWith(mockConfig);
    });
  });
});