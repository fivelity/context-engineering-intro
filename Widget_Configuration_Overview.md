## Deep Overview of the Widget Configuration System and User Flow in SenseCanvas

The SenseCanvas dashboard provides extensive customization options for monitoring PC sensor data through its sophisticated **Widget Configurator**. This system is designed for intuitive interaction and deep personalization, featuring a two-column layout for immediate visual feedback.

*   **Left Column (Controls):** This area houses a tabbed interface containing all adjustable settings for the widget.
*   **Right Column (Live Preview):** As changes are made in the controls, a live preview of the widget is rendered here, allowing users to see the impact of their modifications in real-time.

Widget configuration is structured across three main tabs within the configurator:

1.  **General Tab:** Focuses on the core properties of the widget:
    *   **Widget Title:** Sets the display title for the widget.
    *   **Display Type:** Determines the visual style (Gauge, Graph, Simple, Meter, Multi-Resource).
    *   **Data Source / Sensors:** Links the widget to specific real-time sensor data. Multiple sensors can be selected for `Multi-Resource` widgets.
    *   **Orientation:** Controls the internal layout flow of elements within the widget (Vertical or Horizontal).
2.  **Style Tab:** Offers detailed visual customization, organized into accordion sections:
    *   **Appearance:** Configures the look based on the `Display Type`, including styles (e.g., circular/arc for gauges, area/line for graphs), color controls, thickness/width adjustments, and specific options for arc gauges (start/end angle, tick count).
    *   **Icon:** Manages the widget's icon, allowing users to show/hide it, select from an `Icon Picker`, and style its size, color, and thickness.
    *   **Typography & Text:** Provides control over text elements, including toggling the visibility of the main `Value` and secondary `Label` text, setting their colors, and overriding the default sensor unit.
    *   **Border:** Enables adding a custom border to the widget card and setting its color and width.
3.  **Alerts Tab:** Allows users to set up conditions for visual changes and notifications:
    *   **Enable Alerts:** A master switch to activate or deactivate all alerts for the widget.
    *   **Thresholds:** Users can define multiple alert conditions. Each threshold includes a `Value` that triggers the alert when exceeded, a `Color` to visually indicate the alert state on the widget, and a custom `Message` for toast notifications.

### User Flow: Adding & Editing Widgets

The process for managing widgets is designed for flexibility and ease of use:

1.  **Open Configurator:** The user clicks the **Plus (`+`)** icon in the toolbar to open the Widget Configurator modal.
2.  **Choose Your Path:** The user decides how to start building their widget:
    *   **From Library:** Select an existing widget preset from the library to quickly add a pre-configured widget.
    *   **Create Custom:** Begin building a new widget from scratch, with full access to all configuration options.
3.  **Configure:** The user adjusts the desired settings using the `General`, `Style`, and `Alerts` tabs, observing the real-time changes in the live preview.
4.  **Finalize:** Once satisfied with the configuration, the user can either:
    *   Add the configured widget directly to the dashboard.
    *   Save the configuration as a new preset in the Widget Preset Library for future use.

### Editing Widgets

SenseCanvas offers two methods for editing existing widgets:

*   **From the Dashboard:** Right-clicking any widget on the dashboard reveals a context menu with an "Edit Widget" option. Selecting this re-opens the Widget Configurator with the current widget's settings pre-loaded.
*   **From the Library:** Users can click the vertical dots icon on a preset card within the Widget Preset Library and choose "Edit". Crucially, this action opens the preset's configuration within the "Create Custom" view of the configurator. This allows users to see exactly how the preset was constructed and use it as a starting point for creating their own modified version.

### The Role of the Widget Preset Library

The **Widget Preset Library** serves as a central hub for managing widget configurations. Its primary functions are:

*   **Quick Addition:** Provides a collection of pre-configured widgets that can be added to the dashboard with a single click.
*   **Reusability:** Allows users to save their custom widget designs as presets, which can then be easily added to the dashboard multiple times or used as templates.
*   **Sharing:** Enables users to share their favorite widget configurations with others (though the exact sharing mechanism is not detailed in the provided text, the existence of export/import suggests this capability).
*   **Learning Tool:** By allowing users to edit presets in the "Create Custom" view, the library acts as a valuable resource for understanding how different visual styles and configurations are achieved.

In conclusion, the SenseCanvas widget configuration system, centered around the powerful Widget Configurator and supported by the Widget Preset Library, offers users a deep level of control over their dashboard's appearance and functionality, making it truly hyper-customizable.