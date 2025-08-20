// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FileSystemItem, File, Folder } from './types';
import { 
  VscFile, 
  VscFolder, 
  VscFolderOpened, 
  VscEdit, 
  VscTrash,
  VscChevronRight,
  VscChevronDown,
  VscKebabVertical,
  VscJson,
  VscCode,
  VscFileCode,
  VscSymbolClass,
  VscFileMedia,
  VscSettings,
  VscNewFile,
  VscNewFolder
} from 'react-icons/vsc';

interface FileTreeProps {
  items: FileSystemItem[];
  onFileSelect: (file: File) => void;
  onDeleteItem: (item: FileSystemItem) => void;
  onRenameItem: (item: FileSystemItem, newName: string) => void;
  onAddItem: (parent: Folder, item: FileSystemItem) => void;
  allCollapsed: boolean;
  activeFile: File | null;
}

const FileTree: React.FC<FileTreeProps> = ({ items, onFileSelect, onDeleteItem, onRenameItem, onAddItem, allCollapsed, activeFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right?: number; left?: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortItems = (items: FileSystemItem[]): FileSystemItem[] => {
    return [...items].sort((a, b) => {
      // First, sort by type (folders first)
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Then sort alphabetically by name (case-insensitive)
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  };

  useEffect(() => {
    if (allCollapsed) {
      setExpandedFolders([]);
    }
  }, [allCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <VscCode className="mr-2 text-yellow-600 flex-shrink-0" size={16} />;
      case 'json':
        return <VscJson className="mr-2 text-green-600 flex-shrink-0" size={16} />;
      case 'html':
      case 'htm':
        return <VscFileCode className="mr-2 text-orange-600 flex-shrink-0" size={16} />;
      case 'css':
      case 'scss':
      case 'sass':
        return <VscSymbolClass className="mr-2 text-blue-600 flex-shrink-0" size={16} />;
      case 'md':
      case 'markdown':
        return <VscFileMedia className="mr-2 text-gray-700 flex-shrink-0" size={16} />;
      case 'config':
      case 'conf':
      case 'xml':
        return <VscSettings className="mr-2 text-gray-600 flex-shrink-0" size={16} />;
      default:
        return <VscFile className="mr-2 text-gray-500 flex-shrink-0" size={16} />;
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName) ? prev.filter((name) => name !== folderName) : [...prev, folderName]
    );
  };

  const [renamingItem, setRenamingItem] = useState<FileSystemItem | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (item: FileSystemItem) => {
    setRenamingItem(item);
    setNewName(item.name);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingItem) {
      onRenameItem(renamingItem, newName);
      setRenamingItem(null);
    }
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      toggleFolder(item.name);
    } else {
      onFileSelect(item);
    }
  };

  const handleDropdownToggle = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    
    if (openDropdown === itemName) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 4,
        right: window.innerWidth - buttonRect.right
      });
      setOpenDropdown(itemName);
    }
  };

  const handleRightClick = (e: React.MouseEvent, itemName: string) => {
    e.preventDefault(); // Prevent browser default context menu
    e.stopPropagation();
    
    // Close existing dropdown if it's the same item
    if (openDropdown === itemName) {
      setOpenDropdown(null);
      setDropdownPosition(null);
      return;
    }
    
    // Calculate dropdown position with bounds checking
    const dropdownWidth = 120; // Approximate width of dropdown
    const spaceOnRight = window.innerWidth - e.clientX;
    const spaceOnLeft = e.clientX;
    
    let position: { top: number; right?: number; left?: number };
    
    if (spaceOnRight >= dropdownWidth) {
      // Show on the right side (normal case)
      position = {
        top: e.clientY,
        left: e.clientX
      };
    } else if (spaceOnLeft >= dropdownWidth) {
      // Show on the left side if not enough space on right
      position = {
        top: e.clientY,
        left: e.clientX - dropdownWidth
      };
    } else {
      // Fallback: show on right side but adjust to fit
      position = {
        top: e.clientY,
        left: Math.max(0, window.innerWidth - dropdownWidth)
      };
    }
    
    setDropdownPosition(position);
    setOpenDropdown(itemName);
  };

  const handleDropdownAction = (action: 'rename' | 'delete' | 'addFile' | 'addFolder', item: FileSystemItem) => {
    setOpenDropdown(null);
    setDropdownPosition(null);
    if (action === 'rename') {
      handleRename(item);
    } else if (action === 'delete') {
      onDeleteItem(item);
    } else if (action === 'addFile' && item.type === 'folder') {
      handleAddFileWithExpansion(item);
    } else if (action === 'addFolder' && item.type === 'folder') {
      handleAddFolderWithExpansion(item);
    }
  };

  const findItemByName = (items: FileSystemItem[], name: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.name === name) {
        return item;
      }
      if (item.type === 'folder') {
        const found = findItemByName(item.items, name);
        if (found) return found;
      }
    }
    return null;
  };

  const handleAddFile = (parent: Folder) => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      onAddItem(parent, { type: 'file', name: fileName, content: '' });
    }
  };

  const handleAddFolder = (parent: Folder) => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      onAddItem(parent, { type: 'folder', name: folderName, items: [] });
    }
  };

  const handleAddFileWithExpansion = (parent: Folder) => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      // Auto-expand the parent folder if it's collapsed
      if (!expandedFolders.includes(parent.name)) {
        setExpandedFolders(prev => [...prev, parent.name]);
      }
      
      // Add the file
      const newFile: File = { type: 'file', name: fileName, content: '' };
      onAddItem(parent, newFile);
      
      // Auto-select the newly created file
      setTimeout(() => {
        onFileSelect(newFile);
      }, 50); // Small delay to ensure the file is added to the tree first
    }
  };

  const handleAddFolderWithExpansion = (parent: Folder) => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      // Auto-expand the parent folder if it's collapsed
      if (!expandedFolders.includes(parent.name)) {
        setExpandedFolders(prev => [...prev, parent.name]);
      }
      
      // Add the folder
      onAddItem(parent, { type: 'folder', name: folderName, items: [] });
    }
  };

  const sortedItems = sortItems(items);

  return (
    <ul className="text-gray-700 text-[13px]">
      {sortedItems.map((item) => {
        const isExpanded = item.type === 'folder' && expandedFolders.includes(item.name);
        const isActiveFile = item.type === 'file' && activeFile?.name === item.name;
        
        return (
          <li key={item.name}>
            <div 
              className={`group flex items-center py-[1px] px-2 cursor-pointer justify-between text-gray-700 text-[13px] ${
                isActiveFile 
                  ? 'bg-blue-100 border-r-2 border-blue-500' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick(item)}
              onContextMenu={(e) => handleRightClick(e, item.name)}
              data-item={item.name}
            >
              {renamingItem === item ? (
                <form onSubmit={handleRenameSubmit} className="w-full">
                                      <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    autoFocus
                    className="bg-white border border-blue-500 rounded px-1.5 py-0.5 w-full text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </form>
              ) : (
                <>
                  <div className="flex items-center min-w-0 flex-1">
                    {item.type === 'folder' ? (
                      <>
                        {isExpanded ? (
                          <VscChevronDown className="mr-2 text-gray-500 flex-shrink-0" size={16} />
                        ) : (
                          <VscChevronRight className="mr-2 text-gray-500 flex-shrink-0" size={16} />
                        )}
                        <span className="truncate text-[13px]">{item.name}</span>
                      </>
                    ) : (
                      <>
                        {getFileIcon(item.name)}
                        <span className="truncate text-[13px]">{item.name}</span>
                      </>
                    )}
                  </div>
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={(e) => handleDropdownToggle(e, item.name)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                    >
                      <VscKebabVertical className="text-[13px]" />
                    </button>

                  </div>
                </>
              )}
            </div>
            {isExpanded && item.type === 'folder' && (
              <div className="pl-1.5 border-l border-gray-300 ml-1.5">
                <FileTree
                  items={sortItems(item.items)}
                  onFileSelect={onFileSelect}
                  onDeleteItem={onDeleteItem}
                  onRenameItem={onRenameItem}
                  onAddItem={onAddItem}
                  allCollapsed={allCollapsed}
                  activeFile={activeFile}
                />
              </div>
            )}
          </li>
        );
      })}
      {openDropdown && dropdownPosition && (() => {
        const currentItem = findItemByName(items, openDropdown);
        return currentItem ? createPortal(
          <div 
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px]"
            style={{ 
              top: dropdownPosition.top,
              ...(dropdownPosition.left !== undefined ? { left: dropdownPosition.left } : {}),
              ...(dropdownPosition.right !== undefined ? { right: dropdownPosition.right } : {}),
              zIndex: 9999 
            }}
          >
            {currentItem.type === 'folder' && (
              <>
                <button
                  onClick={() => handleDropdownAction('addFile', currentItem)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center"
                >
                  <VscNewFile className="mr-1.5 text-xs" />
                  Add File
                </button>
                <button
                  onClick={() => handleDropdownAction('addFolder', currentItem)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center"
                >
                  <VscNewFolder className="mr-1.5 text-xs" />
                  Add Folder
                </button>
                <div className="border-t border-gray-200 my-0.5"></div>
              </>
            )}
            <button
              onClick={() => handleDropdownAction('rename', currentItem)}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center"
            >
              <VscEdit className="mr-1.5 text-xs" />
              Rename
            </button>
            <button
              onClick={() => handleDropdownAction('delete', currentItem)}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center text-red-600"
            >
              <VscTrash className="mr-1.5 text-xs" />
              Delete
            </button>
          </div>,
          document.body
        ) : null;
      })()}
    </ul>
  );
};

export default FileTree;
