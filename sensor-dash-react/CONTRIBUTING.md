# Contributing to Sensor Dashboard

We welcome contributions to the Sensor Dashboard project! To ensure a smooth and efficient collaboration, please follow these guidelines.

## How to Contribute

1.  **Create a branch for your feature**: Before starting any work, create a new branch from `main` for your feature or bug fix. Use a descriptive name for your branch (e.g., `feature/new-widget-type`, `bugfix/websocket-disconnect`).
2.  **Implement your changes**: Write clean, well-documented code that adheres to the project's coding style and conventions.
3.  **Update documentation**: If your changes introduce new features or modify existing ones, please update the relevant documentation files in the `docs/` directory.
4.  **Test your changes**: Ensure that your changes do not introduce any regressions and that all existing tests pass. If applicable, add new unit or E2E tests for your changes.
5.  **Update the progress document**: Briefly describe your changes in `docs/progress.md` under the appropriate section (e.g., `Completed Features`, `In Progress`).
6.  **Submit a pull request**: Once your changes are complete and tested, submit a pull request to the `main` branch. Provide a clear and concise description of your changes in the pull request message.

## Code Style and Quality

-   **Frontend**: Adhere to SvelteKit and Svelte 5 best practices. Use TypeScript for type safety. Follow Tailwind CSS conventions.
-   **Backend**: Adhere to FastAPI and Python best practices. Use Pydantic for data validation. Ensure proper error handling and logging.
-   **Linting and Formatting**: Ensure your code passes ESLint and Prettier checks for the frontend, and any configured linters for the backend.

## Reporting Bugs

If you find a bug, please open an issue on the GitHub repository. Provide a detailed description of the bug, including steps to reproduce it, expected behavior, and actual behavior.

## Feature Requests

If you have an idea for a new feature, please open an issue on the GitHub repository to discuss it. Describe the feature, its potential benefits, and any relevant use cases.

## Technical Debt & Quality Improvements

We are continuously working to improve the quality and performance of the Sensor Dashboard. Contributions in the following areas are highly valued:

-   Unit tests for core components
-   E2E testing for critical user flows
-   Performance profiling and optimization
-   Accessibility improvements
-   Documentation updates
