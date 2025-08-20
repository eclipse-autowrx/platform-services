// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileSystemItem, File, Folder } from './types';
import FileTree from './FileTree';
import EditorComponent from './Editor';
import JSZip from 'jszip';

import { VscNewFile, VscNewFolder, VscRefresh, VscCollapseAll, VscChevronLeft, VscChevronRight } from 'react-icons/vsc';


interface ProjectEditorProps {
  data: string;
  onChange: (data: string) => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ data, onChange }) => {
  const [fsData, setFsData] = useState<FileSystemItem[]>(() => JSON.parse(data));
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const collapsedWidth = 48; // Width when collapsed

  useEffect(() => {
    onChange(JSON.stringify(fsData));
  }, [fsData, onChange]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return; // Don't allow resizing when collapsed
    e.preventDefault();
    setIsResizing(true);
  }, [isCollapsed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || isCollapsed) return;

    const minWidth = 200;
    const maxWidth = 600;
    const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
    setLeftPanelWidth(newWidth);
  }, [isResizing, isCollapsed]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleFileSelect = (file: File) => {
    if (!openFiles.find((f) => f.name === file.name)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFile(file);
  };

  const handleCloseFile = (file: File) => {
    const newOpenFiles = openFiles.filter((f) => f.name !== file.name);
    setOpenFiles(newOpenFiles);
    if (activeFile?.name === file.name) {
      setActiveFile(newOpenFiles[0] || null);
    }
  };

  const handleDeleteItem = (item: FileSystemItem) => {
    const deleteItem = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.filter((i) => i.name !== item.name).map((i) => {
        if (i.type === 'folder') {
          return { ...i, items: deleteItem(i.items) };
        }
        return i;
      });
    };
    const newFileSystem = deleteItem(fsData);
    setFsData(newFileSystem);
  };

  const handleRenameItem = (item: FileSystemItem, newName: string) => {
    const renameItem = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((i) => {
        if (i.name === item.name) {
          return { ...i, name: newName };
        }
        if (i.type === 'folder') {
          return { ...i, items: renameItem(i.items) };
        }
        return i;
      });
    };
    const newFileSystem = renameItem(fsData);
    setFsData(newFileSystem);
  };

  const handleAddItemToRoot = (type: 'file' | 'folder') => {
    const name = prompt(`Enter new ${type} name:`);
    if (!name) return;

    const newItem: FileSystemItem = type === 'file'
      ? { type: 'file', name, content: '' }
      : { type: 'folder', name, items: [] };

    setFsData(prevFsData => {
      const newFsData = [...prevFsData];
      const root = newFsData[0];
      if (root && root.type === 'folder') {
        if (root.items.some(item => item.name === name)) {
          alert(`${type} with name "${name}" already exists at the root.`);
          return prevFsData;
        }
        const newRoot: Folder = { ...root, items: [...root.items, newItem] };
        newFsData[0] = newRoot;
        return newFsData;
      }
      return prevFsData;
    });
  };

  const handleRefresh = () => {
    setFsData(JSON.parse(data));
  };

  const [allCollapsed, setAllCollapsed] = useState(false);

  const handleCollapseAll = () => {
    setAllCollapsed(true);
    // Let FileTree know it needs to collapse all
    setTimeout(() => setAllCollapsed(false), 0);
  };

  const handleAddItem = (parent: Folder, item: FileSystemItem) => {
    const addItem = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((i) => {
        if (i.name === parent.name && i.type === 'folder') {
          return { ...i, items: [...i.items, item] };
        }
        if (i.type === 'folder') {
          return { ...i, items: addItem(i.items) };
        }
        return i;
      });
    };
    const newFileSystem = addItem(fsData);
    setFsData(newFileSystem);
  };

  const handleExport = () => {
    const zip = new JSZip();

    const addFilesToZip = (items: FileSystemItem[], path: string) => {
      items.forEach((item) => {
        if (item.type === 'file') {
          zip.file(path + item.name, item.content);
        } else {
          addFilesToZip(item.items, path + item.name + '/');
        }
      });
    };

    addFilesToZip(fsData, '');

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'project.zip';
      link.click();
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const zip = new JSZip();
      zip.loadAsync(event.target?.result as ArrayBuffer).then((zip) => {
        const fileSystem: FileSystemItem[] = [];
        const folders: { [key: string]: Folder } = {};

        const getOrCreateFolder = (path: string): Folder => {
          if (folders[path]) {
            return folders[path];
          }

          const parts = path.split('/');
          const folderName = parts.pop() || '';
          const parentPath = parts.join('/');
          const parentFolder = getOrCreateFolder(parentPath);

          const newFolder: Folder = {
            type: 'folder',
            name: folderName,
            items: [],
          };

          parentFolder.items.push(newFolder);
          folders[path] = newFolder;
          return newFolder;
        };

        const root: Folder = { type: 'folder', name: 'root', items: [] };
        folders[''] = root;

        const promises = Object.values(zip.files).map(async (zipEntry) => {
          const path = zipEntry.name;
          const parts = path.split('/').filter(p => p);
          if (zipEntry.dir) {
            getOrCreateFolder(path.slice(0, -1));
          } else {
            const fileName = parts.pop() || '';
            const folderPath = parts.join('/');
            const folder = getOrCreateFolder(folderPath);
            const content = await zipEntry.async('string');
            folder.items.push({ type: 'file', name: fileName, content });
          }
        });

        Promise.all(promises).then(() => {
          setFsData(root.items);
        });
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = (e) => handleImport(e as any);
    input.click();
  };

  const root = fsData[0];
  const projectName = root?.name || 'Editor';
  const projectItems = root?.type === 'folder' ? root.items : [];

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans">
      <div
        className="bg-gray-50 border-r border-gray-200 relative transition-all duration-200 ease-in-out"
        style={{ width: isCollapsed ? collapsedWidth : leftPanelWidth }}
      >
        {isCollapsed ? (
          // Collapsed view - thin column with just expand button
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center py-2 border-b border-gray-200 bg-gray-100">
              <button
                onClick={toggleCollapse}
                title="Expand Panel"
                className="p-2 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
              >
                <VscChevronRight size={20} />
              </button>
            </div>
            <div className="flex-1"></div>
          </div>
        ) : (
          // Expanded view - normal layout
          <>
            <div className="flex items-center px-1 py-2 border-b border-gray-200 bg-gray-100">
              <button
                onClick={toggleCollapse}
                title="Collapse Panel"
                className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
              >
                <VscChevronLeft size={16} />
              </button>
              <span className="grow pl-1 font-semibold text-sm tracking-wide text-gray-700">{projectName.toUpperCase()}</span>
              <div className="flex items-center space-x-1">

                <button
                  onClick={() => handleAddItemToRoot('file')}
                  title="New File"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <VscNewFile size={16} />
                </button>
                <button
                  onClick={() => handleAddItemToRoot('folder')}
                  title="New Folder"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <VscNewFolder size={16} />
                </button>
                {/* <button
                  onClick={handleRefresh}
                  title="Refresh"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <VscRefresh size={16} />
                </button> */}
                <button
                  onClick={handleCollapseAll}
                  title="Collapse All"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <VscCollapseAll size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto overflow-x-visible">
              <FileTree
                items={projectItems}
                onFileSelect={handleFileSelect}
                onDeleteItem={handleDeleteItem}
                onRenameItem={handleRenameItem}
                onAddItem={handleAddItem}
                allCollapsed={allCollapsed}
                activeFile={activeFile}
              />
            </div>
          </>
        )}
        {/* Resize Handle - only show when not collapsed */}
        {!isCollapsed && (
          <div
            ref={resizeRef}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors ${isResizing ? 'bg-blue-500 bg-opacity-50' : ''
              }`}
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-0.5 h-8 bg-gray-400 transition-opacity ${isResizing ? 'opacity-100' : 'opacity-0 hover:opacity-60'}`} />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <EditorComponent
          file={activeFile}
          openFiles={openFiles}
          onSelectFile={setActiveFile}
          onCloseFile={handleCloseFile}
        />
      </div>
    </div>
  );
};

export default ProjectEditor;
