# Project Editor

A reusable React component that provides a complete project editing experience, including a file tree, a tabbed code editor with syntax highlighting, file operations, and ZIP import/export functionality.

## Features

- **File Tree View**: A collapsible tree view to display the project's file and folder structure.
- **File Operations**:
  - Create new files and folders.
  - Rename existing files and folders.
  - Delete files and folders.
- **Tabbed Code Editor**:
  - Open multiple files in a tabbed interface.
  - Close tabs to remove files from the editor.
  - Powered by **Monaco Editor** for a rich editing experience.
- **Syntax Highlighting**: Automatic syntax highlighting for various languages, including JavaScript, Python, TypeScript, Rust, C, and C++.
- **ZIP Import/Export**:
  - Export the entire project structure as a `.zip` file.
  - Import a project from a `.zip` file, including empty folders.

## Installation

This component is not yet published to any package manager. To use it in another project, you can copy the `project-editor/src` directory and its dependencies into your project.

### Dependencies

- `react`
- `react-dom`
- `@monaco-editor/react`
- `monaco-editor`
- `jszip`

## Usage

To use the `ProjectEditor` component, import it into your React application and provide the required props.

```jsx
import React from 'react';
import ProjectEditor from './path/to/ProjectEditor';

const App = () => {
  const initialData = [
    {
      "type": "folder",
      "name": "project",
      "items": [
        {
          "type": "file",
          "name": "index.js",
          "content": "console.log('Hello, world!');"
        }
      ]
    }
  ];

  const handleChange = (data) => {
    console.log('Project data changed:', data);
  };

  return (
    <ProjectEditor
      data={JSON.stringify(initialData)}
      onChange={handleChange}
    />
  );
};

export default App;
```

### Props

- `data` (string): A JSON string representing the file and folder structure of the project.
- `onChange` (function): A callback function that is called whenever the project structure changes. It receives the updated project structure as a JSON string.

### Data Structure

The `data` prop expects a JSON string with the following structure:

```json
[
  {
    "type": "folder",
    "name": "project",
    "items": [
      {
        "type": "folder",
        "name": "src",
        "items": [
          {
            "type": "file",
            "name": "index.js",
            "content": "console.log('Hello, world!');"
          }
        ]
      },
      {
        "type": "file",
        "name": "README.md",
        "content": "# My Project"
      }
    ]
  }
]
```

## Development

To run the `ProjectEditor` component in a local development environment:

1.  Navigate to the `project-editor` directory:
    ```sh
    cd project-editor
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Start the development server:
    ```sh
    npm run dev
    ```
This will open a test page at `http://localhost:5173` where you can see the component in action.
