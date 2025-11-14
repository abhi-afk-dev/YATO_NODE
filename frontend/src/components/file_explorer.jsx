import { useState, useEffect } from 'react';
import { webcontainerInstance } from './api';

async function readDirectoryContents(path, fs) {
    try {
        const files = await fs.readdir(path, { withFileTypes: true });
        const contents = [];

        for (const file of files) {
            const fullPath = `${path}/${file.name}`;
            if (file.isDirectory() && file.name === 'node_modules') {
                continue;
            }

            if (file.isDirectory()) {
                contents.push({
                    name: file.name,
                    path: fullPath,
                    type: 'directory',
                    children: null,
                    isLoaded: false
                });
            } else {
                contents.push({
                    name: file.name,
                    path: fullPath,
                    type: 'file'
                });
            }
        }
        return contents;
    } catch (error) {
        console.error(`Error reading directory ${path}:`, error);
        return []; 
    }
}

const FileSystemItem = ({ item, onFileSelect, level = 0, onToggleDirectory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingChildren, setIsLoadingChildren] = useState(false);
    const indent = (level * 16) + 8; 

    const handleItemClick = async () => {
        if (item.type === 'directory') {
            if (!isOpen && !item.isLoaded) {
                setIsLoadingChildren(true);
                await onToggleDirectory(item.path);
                setIsLoadingChildren(false);
            }
            setIsOpen(!isOpen);
        } else {
            onFileSelect(item.path); 
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop();
        switch (ext) {
            case 'jsx':
            case 'tsx':
                return <span className="text-blue-500">⚛️</span>;
            case 'js':
            case 'ts':
                return '📄';
            case 'html':
                return '🌐';
            case 'css':
                return '🎨';
            case 'json':
                return '📃';
            case 'md':
                return '📝';
            case 'gitignore':
                return '🚫'; 
            default:
                return '📄'; 
        }
    };

    return (
        <div>
            <div
                style={{ paddingLeft: `${indent}px` }}
                className="flex items-center cursor-pointer text-sm py-1 hover:bg-zinc-700 rounded-md"
                onClick={handleItemClick} 
            >
                <span className="mr-1">
                    {item.type === 'directory' ? (
                        isLoadingChildren ? '⏳' : (isOpen ? '📂' : '📁')
                    ) : (
                        getFileIcon(item.name) 
                    )}
                </span>
                {item.name}
            </div>
            {item.type === 'directory' && isOpen && item.children && (
                <div className="ml-2"> 
                    {item.children.map(child => (
                        <FileSystemItem
                            key={child.path}
                            item={child}
                            onFileSelect={onFileSelect}
                            onToggleDirectory={onToggleDirectory} 
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer = ({ onFileSelect }) => {
    const [fileTree, setFileTree] = useState([]);
    const [isLoadingRoot, setIsLoadingRoot] = useState(true);

    const updateTreeWithChildren = (currentTree, targetPath, newChildren) => {
        return currentTree.map(node => {
            if (node.path === targetPath) {
                return { ...node, children: newChildren, isLoaded: true };
            }
            if (node.type === 'directory' && node.children) {
                return {
                    ...node,
                    children: updateTreeWithChildren(node.children, targetPath, newChildren)
                };
            }
            return node;
        });
    };

    const handleToggleDirectory = async (directoryPath) => {
        if (!webcontainerInstance) {
            console.warn("WebContainer instance not ready for file explorer.");
            return;
        }

        const newChildren = await readDirectoryContents(directoryPath, webcontainerInstance.fs);
        setFileTree(prevTree => updateTreeWithChildren(prevTree, directoryPath, newChildren));
    };

    const refreshFileTree = async () => {
        if (!webcontainerInstance) {
            console.warn("WebContainer instance not ready for file explorer.");
            setIsLoadingRoot(false);
            return;
        }
        setIsLoadingRoot(true);
        try {
            const rootContents = await readDirectoryContents('/', webcontainerInstance.fs);
            setFileTree(rootContents);
        } catch (error) {
            console.error("Error refreshing root file tree:", error);
            setFileTree([]); 
        } finally {
            setIsLoadingRoot(false);
        }
    };

    useEffect(() => {
        refreshFileTree();

    }, []); 

    return (
        <div className="w-1/4 h-full bg-[#1A1A1A] text-white p-4 rounded border border-zinc-600 flex flex-col overflow-y-auto">
            <div className="flex flex-row w-full justify-between items-center">
            <h2 className="text-xl font-bold mb-4">File Explorer</h2>
                <button
                    onClick={refreshFileTree}
                    className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                    title="Refresh Files"
                >
                    R
                </button>
            </div>

            {isLoadingRoot ? (
                <p>Loading files...</p>
            ) : fileTree.length === 0 ? (
                <p>No files found. Create a project using the terminal buttons!</p>
            ) : (
                <div className="space-y-1">
                    {fileTree.map(item => (
                        <FileSystemItem
                            key={item.path}
                            item={item}
                            onFileSelect={onFileSelect}
                            onToggleDirectory={handleToggleDirectory}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
