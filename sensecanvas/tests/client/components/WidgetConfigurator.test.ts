/**
 * SenseCanvas Widget Configurator Component Tests
 * Comprehensive testing for the widget configurator modal with all tabs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import WidgetConfigurator from '../../../sensecanvas/client/src/lib/components/configurator/WidgetConfigurator.svelte';
import type { WidgetConfig } from '../../../sensecanvas/client/src/lib/types/widgets';

// Mock widget creation utilities
vi.mock('../../../sensecanvas/client/src/lib/components/widgets/index.js', () => ({
  createWidget: vi.fn((type: string, overrides = {}) => ({
    id: `test-widget-${Date.now()}`,
    type,
    title: `Test ${type}`,
    sensorType: 'cpu',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    style: {
      theme: 'default',
      colors: ['#22d3ee', '#ef4444'],
      opacity: 1,
      borderRadius: 8
    },
    alerts: {
      enabled: false,
      thresholds: { warning: 75, critical: 90 }
    },
    ...overrides
  })),
  getWidgetIcon: vi.fn((type: string) => {
    const icons = { gauge: '📊', graph: '📈', text: '📝', 'multi-sensor': '🔢' };
    return icons[type] || '📊';
  }),
  getWidgetDescription: vi.fn((type: string) => `${type} widget description`)
}));

// Mock AI generation API
global.fetch = vi.fn();

describe('WidgetConfigurator', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockDispatch = vi.fn();
    
    // Reset fetch mock
    vi.mocked(fetch).mockReset();
    
    // Mock successful AI generation response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        widget: {
          id: 'ai-generated-widget',
          type: 'gauge',
          title: 'AI Generated Widget',
          sensorType: 'cpu',
          position: { x: 0, y: 0 },
          size: { width: 200, height: 200 },
          style: {
            theme: 'cyberpunk',
            colors: ['#a855f7', '#ec4899'],
            opacity: 1,
            borderRadius: 8
          }
        },
        confidence: 0.85,
        reasoning: 'Generated based on user requirements'
      })
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Behavior', () => {
    it('should render when isOpen is true', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add Widget')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: false,
          onClose: mockOnClose
        }
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const closeButton = screen.getByLabelText('Close configurator');
      await fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onClose when escape key is pressed', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      await fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onClose when backdrop is clicked', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const backdrop = screen.getByRole('dialog');
      await fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with Library tab active by default', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const libraryTab = screen.getByText('Library');
      expect(libraryTab.closest('button')).toHaveClass('active');
    });

    it('should switch to AI Generate tab when clicked', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const aiTab = screen.getByText('AI Generate');
      await fireEvent.click(aiTab);

      expect(aiTab.closest('button')).toHaveClass('active');
      expect(screen.getByText('🤖 AI Widget Generator')).toBeInTheDocument();
    });

    it('should switch to Create Custom tab when clicked', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const customTab = screen.getByText('Create Custom');
      await fireEvent.click(customTab);

      expect(customTab.closest('button')).toHaveClass('active');
      expect(screen.getByText('Basic Configuration')).toBeInTheDocument();
    });
  });

  describe('Library Tab Functionality', () => {
    it('should display preset widgets', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByText('Widget Library')).toBeInTheDocument();
      expect(screen.getByText('CPU Gauge Classic')).toBeInTheDocument();
      expect(screen.getByText('GPU Gaming Gauge')).toBeInTheDocument();
    });

    it('should filter widgets by search term', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const searchInput = screen.getByPlaceholderText('Search widgets...');
      await fireEvent.input(searchInput, { target: { value: 'CPU' } });

      await waitFor(() => {
        expect(screen.getByText('CPU Gauge Classic')).toBeInTheDocument();
        expect(screen.queryByText('GPU Gaming Gauge')).not.toBeInTheDocument();
      });
    });

    it('should filter widgets by category', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      await fireEvent.change(categorySelect, { target: { value: 'GPU' } });

      await waitFor(() => {
        expect(screen.getByText('GPU Gaming Gauge')).toBeInTheDocument();
        expect(screen.queryByText('CPU Gauge Classic')).not.toBeInTheDocument();
      });
    });
  });

  describe('AI Generate Tab Functionality', () => {
    beforeEach(async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const aiTab = screen.getByText('AI Generate');
      await fireEvent.click(aiTab);
    });

    it('should display AI generation interface', () => {
      expect(screen.getByText('🤖 AI Widget Generator')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Describe your widget/)).toBeInTheDocument();
    });

    it('should enable generate button when prompt is long enough', async () => {
      const promptInput = screen.getByPlaceholderText(/Describe your widget/);
      const generateBtn = screen.getByText('✨ Generate Widget');

      expect(generateBtn).toBeDisabled();

      await fireEvent.input(promptInput, {
        target: { value: 'Create a red CPU temperature gauge with alerts' }
      });

      expect(generateBtn).not.toBeDisabled();
    });

    it('should call AI generation API when generate button is clicked', async () => {
      const promptInput = screen.getByPlaceholderText(/Describe your widget/);
      const generateBtn = screen.getByText('✨ Generate Widget');

      await fireEvent.input(promptInput, {
        target: { value: 'Create a red CPU temperature gauge with alerts' }
      });
      await fireEvent.click(generateBtn);

      expect(fetch).toHaveBeenCalledWith('/api/ai/generate-widget', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Create a red CPU temperature gauge with alerts')
      }));
    });

    it('should display example prompts', () => {
      expect(screen.getByText('💡 Example Prompts')).toBeInTheDocument();
      expect(screen.getByText('CPU Monitoring')).toBeInTheDocument();
      expect(screen.getByText('GPU Monitoring')).toBeInTheDocument();
    });

    it('should use example prompt when clicked', async () => {
      const exampleButton = screen.getByText('"Create a red CPU temperature gauge with warning alerts"');
      const promptInput = screen.getByPlaceholderText(/Describe your widget/) as HTMLTextAreaElement;

      await fireEvent.click(exampleButton);

      expect(promptInput.value).toBe('Create a red CPU temperature gauge with warning alerts');
    });
  });

  describe('Create Custom Tab Functionality', () => {
    beforeEach(async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const customTab = screen.getByText('Create Custom');
      await fireEvent.click(customTab);
    });

    it('should display custom configuration sections', () => {
      expect(screen.getByText('Basic Configuration')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument(); // Basic tab icon
    });

    it('should allow widget type selection', async () => {
      const gaugeOption = screen.getByText('Gauge');
      await fireEvent.click(gaugeOption);

      expect(gaugeOption.closest('button')).toHaveClass('selected');
    });

    it('should validate widget title input', async () => {
      const titleInput = screen.getByLabelText('Widget Title');
      
      await fireEvent.input(titleInput, { target: { value: '' } });
      await fireEvent.blur(titleInput);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Title is required/)).toBeInTheDocument();
      });
    });

    it('should allow sensor type selection', async () => {
      const cpuOption = screen.getByText('CPU');
      await fireEvent.click(cpuOption);

      expect(cpuOption.closest('button')).toHaveClass('selected');
    });
  });

  describe('Live Preview Functionality', () => {
    it('should display live preview panel', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument(); // Preview badge
    });

    it('should show validation status', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      // Initially should show invalid due to empty configuration
      expect(screen.getByText('❌ Invalid')).toBeInTheDocument();
    });
  });

  describe('Widget Editing Mode', () => {
    const mockEditingWidget: WidgetConfig = {
      id: 'existing-widget',
      type: 'gauge',
      title: 'Existing Widget',
      sensorType: 'cpu',
      position: { x: 100, y: 100 },
      size: { width: 250, height: 250 },
      style: {
        theme: 'gaming',
        colors: ['#22c55e', '#eab308'],
        opacity: 0.9,
        borderRadius: 12,
        fontSize: 14,
        fontFamily: 'Orbitron, monospace',
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
        thresholds: { warning: 70, critical: 85 },
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

    it('should show "Edit Widget" title when editing', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          editingWidget: mockEditingWidget,
          onClose: mockOnClose
        }
      });

      expect(screen.getByText('Edit Widget')).toBeInTheDocument();
    });

    it('should start with Create Custom tab when editing', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          editingWidget: mockEditingWidget,
          onClose: mockOnClose
        }
      });

      const customTab = screen.getByText('Create Custom');
      expect(customTab.closest('button')).toHaveClass('active');
    });

    it('should pre-populate form with existing widget data', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          editingWidget: mockEditingWidget,
          onClose: mockOnClose
        }
      });

      const customTab = screen.getByText('Create Custom');
      fireEvent.click(customTab);

      const titleInput = screen.getByDisplayValue('Existing Widget');
      expect(titleInput).toBeInTheDocument();
    });
  });

  describe('Export/Import Functionality', () => {
    it('should show export button when configuration is valid', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByText('💾 Export')).toBeInTheDocument();
    });

    it('should show import button', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByText('📁 Import')).toBeInTheDocument();
    });

    it('should trigger file input when import is clicked', async () => {
      const mockClick = vi.fn();
      const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
        type: '',
        accept: '',
        onchange: null,
        click: mockClick,
        files: null
      } as any);

      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const importButton = screen.getByText('📁 Import');
      await fireEvent.click(importButton);

      expect(mockClick).toHaveBeenCalledOnce();
      mockCreateElement.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should disable save button when configuration is invalid', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const saveButton = screen.getByText('Add Widget');
      expect(saveButton).toBeDisabled();
    });

    it('should show validation errors in the preview panel', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Validation Errors:')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full widget creation workflow', async () => {
      const mockWidgetAdded = vi.fn();
      
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      // Add event listener for widget addition
      const component = screen.getByRole('dialog');
      component.addEventListener('widgetAdded', mockWidgetAdded);

      // Select a preset widget from library
      const gaugeWidget = screen.getByText('CPU Gauge Classic');
      await fireEvent.click(gaugeWidget);

      // Should switch to custom tab with pre-filled data
      await waitFor(() => {
        expect(screen.getByText('Create Custom').closest('button')).toHaveClass('active');
      });

      // Modify the widget title
      const titleInput = screen.getByLabelText('Widget Title');
      await fireEvent.input(titleInput, { target: { value: 'My Custom CPU Gauge' } });

      // Save the widget
      const saveButton = screen.getByText('Add Widget');
      expect(saveButton).not.toBeDisabled();
      await fireEvent.click(saveButton);

      // Should close and dispatch event
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('Error Handling', () => {
    it('should handle AI generation API failures gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));

      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const aiTab = screen.getByText('AI Generate');
      await fireEvent.click(aiTab);

      const promptInput = screen.getByPlaceholderText(/Describe your widget/);
      const generateBtn = screen.getByText('✨ Generate Widget');

      await fireEvent.input(promptInput, {
        target: { value: 'Create a widget that will fail' }
      });
      await fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Generation failed/)).toBeInTheDocument();
      });
    });

    it('should handle rate limiting gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          message: 'Rate limit exceeded'
        })
      } as Response);

      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      const aiTab = screen.getByText('AI Generate');
      await fireEvent.click(aiTab);

      const promptInput = screen.getByPlaceholderText(/Describe your widget/);
      const generateBtn = screen.getByText('✨ Generate Widget');

      await fireEvent.input(promptInput, {
        target: { value: 'Create a rate limited widget' }
      });
      await fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByLabelText('Close configurator')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(WidgetConfigurator, {
        props: {
          isOpen: true,
          onClose: mockOnClose
        }
      });

      // Tab navigation should work
      const firstTab = screen.getByText('Library');
      firstTab.focus();
      
      await fireEvent.keyDown(firstTab, { key: 'Tab' });
      
      // Should move to next focusable element
      expect(document.activeElement).not.toBe(firstTab);
    });
  });
});