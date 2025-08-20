// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Editor from '@monaco-editor/react';
import { File } from './types';
import Introduction from './Introduction';

interface EditorComponentProps {
  file: File | null;
  openFiles: File[];
  onSelectFile: (file: File) => void;
  onCloseFile: (file: File) => void;
  fontFamily?: string;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ file, openFiles, onSelectFile, onCloseFile, fontFamily }) => {
  const handleClose = (e: React.MouseEvent, fileToClose: File) => {
    e.stopPropagation();
    onCloseFile(fileToClose);
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'sass':
        return 'sass';
      case 'md':
      case 'markdown':
        return 'markdown';
      case 'xml':
        return 'xml';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
      case 'cc':
      case 'cxx':
        return 'cpp';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'sql':
        return 'sql';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex bg-gray-100 border-b border-gray-200">
        {openFiles.map((f) => (
          <div
            key={f.name}
            className={`group relative py-2 px-4 cursor-pointer text-sm border-r border-gray-200 ${
              file?.name === f.name
                ? 'bg-white text-gray-800 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
            onClick={() => onSelectFile(f)}
          >
            <span className="flex items-center">
              {f.name}
              <button
                onClick={(e) => handleClose(e, f)}
                className={`ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded w-4 h-4 flex items-center justify-center text-xs ${
                  file?.name === f.name ? 'opacity-100' : ''
                }`}
              >
                ×
              </button>
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {file ? (
          <Editor
            height="100%"
            language={getLanguageFromFileName(file.name)}
            value={file?.content}
            theme="light"
            options={{ 
              fontFamily: fontFamily || '"Fira Code", "Consolas", monospace',
              fontSize: 14,
              lineHeight: 1.5,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              wordWrap: 'on'
            }}
          />
        ) : (
          <Introduction />
        )}
      </div>
    </div>
  );
};

export default EditorComponent;
