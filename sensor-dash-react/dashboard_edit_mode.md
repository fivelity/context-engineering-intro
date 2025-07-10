# Dashboard Edit Mode Guide

## Overview

The Edit Mode in Sensor Dashboard allows you to fully customize your dashboard layout by moving, resizing, and organizing widgets according to your preferences. This guide explains how to use the Edit Mode features effectively.

## Enabling Edit Mode

1. Locate the Edit Mode toggle in the top-right corner of the dashboard toolbar.
2. Click the toggle switch to enable Edit Mode. The label will change from "👁️ Viewing" to "🔧 Editing".
3. When Edit Mode is active, all widgets will display a subtle border and become interactive.

## Moving Widgets

In Edit Mode, you can freely move widgets around the dashboard:

1. Hover over any widget to see it highlight.
2. Click and hold on a widget to start dragging it.
3. As you drag, a preview will show where the widget will be placed:
   - **Green preview**: Valid position (no collision with other widgets)
   - **Red preview**: Invalid position (would overlap with another widget)
4. Release the mouse button to place the widget.
5. If you attempt to place a widget in an invalid position, it will return to its original position.
6. Widgets cannot be moved beyond the boundaries of the dashboard canvas.

## Grid System

The dashboard uses a grid system to ensure clean alignment of widgets:

1. Widgets automatically snap to the grid when moved.
2. The grid ensures consistent spacing between widgets.
3. Toggle the "Grid" switch in the toolbar to show/hide the grid overlay.
4. The grid helps maintain a clean, organized layout.
5. **Adjustable Grid Size**: When in Edit Mode, you can adjust the grid size using the controls in the toolbar:
   - Use the "-" button to decrease grid size for finer positioning
   - Use the "+" button to increase grid size for larger movements
   - The current grid size is displayed between the buttons

## Resizing Widgets

You can resize widgets to better fit your needs:

1. Select a widget by clicking on it.
2. Resize handles will appear around the selected widget.
3. Click and drag any handle to resize the widget:
   - Corner handles: Resize both width and height
   - Side handles: Resize width or height only
4. **Continuous Resize**: Click and hold any edge or corner of a widget to resize continuously until you release the mouse button.
5. The widget will maintain grid alignment during resizing.
6. Resizing respects other widgets and prevents overlapping.
7. Each widget has a minimum size to ensure proper content display.
8. Widgets cannot be resized beyond the boundaries of the dashboard canvas.

## Collision Prevention

The dashboard automatically prevents widgets from overlapping:

1. When moving or resizing a widget, the system checks for potential collisions.
2. Visual feedback shows when a position would cause a collision.
3. Widgets cannot be placed or resized in a way that would overlap with other widgets.
4. This ensures a clean, organized dashboard layout at all times.

## Boundary Protection

The dashboard includes boundary protection features:

1. Widgets cannot be moved or resized beyond the canvas boundaries.
2. When resizing or moving a widget near the edge of the canvas, it will automatically stop at the boundary.
3. This prevents widgets from being accidentally positioned off-screen or partially visible.

## Widget Management

Additional widget management options in Edit Mode:

1. **Remove Widget**: Each widget displays a remove button (✕) in the top-right corner when in Edit Mode.
2. **Add Widget**: (Coming soon) Add new widgets from a widget library.
3. **Widget Selection**: Click on a widget to select it (blue border indicates selection).

## Layout Management

The dashboard toolbar provides several layout management options:

1. **Layout Presets**: Choose from predefined layouts using the preset buttons.
2. **Export Layout**: Save your current layout as a JSON file.
3. **Import Layout**: Load a previously exported layout.
4. **Reset Layout**: Return to the default layout.

## Tips for Effective Dashboard Organization

1. **Group Related Widgets**: Place related metrics close to each other (e.g., CPU and temperature).
2. **Prioritize Important Metrics**: Place your most important widgets at the top or in the center.
3. **Use Different Widget Sizes**: Larger widgets for important metrics, smaller for secondary information.
4. **Consider Screen Space**: Organize widgets to minimize scrolling on your typical display.
5. **Create Functional Zones**: Group widgets by function (system resources, temperatures, network, etc.).
6. **Adjust Grid Size**: Use smaller grid sizes for precise positioning and larger grid sizes for quick layouts.

## Exiting Edit Mode

When you've finished customizing your dashboard:

1. Click the Edit Mode toggle to switch back to Viewing mode.
2. Your layout will be automatically saved to your browser's local storage.
3. The layout will persist across browser sessions.

## Keyboard Shortcuts (Coming Soon)

- **Esc**: Cancel current drag operation
- **Delete**: Remove selected widget
- **Arrow Keys**: Fine-tune selected widget position
- **Ctrl + Z**: Undo last change
- **Ctrl + Y**: Redo last change 
