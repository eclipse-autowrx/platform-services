// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import ReactDOM from 'react-dom/client';
import ProjectEditor from './ProjectEditor';
import './index.css';

const sampleData = [
  {
    "type": "folder",
    "name": "Editor",
    "items": [
      {
        "type": "folder",
        "name": "src",
        "items": [
          {
            "type": "file",
            "name": "index.js",
            "content": "console.log('Hello, world!');"
          },
          {
            "type": "file",
            "name": "styles.css",
            "content": "body { font-family: sans-serif; }"
          },
          {
            "type": "folder",
            "name": "components",
            "items": [
              {
                "type": "file",
                "name": "Button.js",
                "content": `import React from 'react';

const Button = () => {
  return <button>Click me</button>;
};

export default Button;`
              }
            ]
          }
        ]
      },
      {
        "type": "folder",
        "name": "public",
        "items": [
          {
            "type": "file",
            "name": "index.html",
            "content": `<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
          }
        ]
      },
      {
        "type": "file",
        "name": "package.json",
        "content": `{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start"
  }
}`
      },
      {
        "type": "file",
        "name": ".gitignore",
        "content": "node_modules/\\ndist/"
      }
    ]
  }
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProjectEditor
      data={JSON.stringify(sampleData)}
      onChange={(value) => console.log(value)}
    />
  </React.StrictMode>,
)
