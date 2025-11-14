import { Editor } from "@monaco-editor/react"
function ZangetsuEditor({ fileContent, onContentChange, selectedFilePath }) {

    function handleEditorDidMount(editor, monaco) {
        monaco.editor.setTheme('vs-dark');
    }

    function handleEditorChange(value) {
        onContentChange(value);
    }

    const getLanguage = (path) => {
        if (!path) return 'plaintext';
        const ext = path.split('.').pop();
        switch (ext) {
            case 'js': return 'javascript';
            case 'jsx': return 'javascript';
            case 'ts': return 'typescript';
            case 'tsx': return 'typescript';
            case 'html': return 'html';
            case 'css': return 'css';
            case 'json': return 'json';
            case 'md': return 'markdown';
            case 'sh': return 'shell';
            case 'yaml': return 'yaml';
            case 'yml': return 'yaml';
            case 'env': return 'plaintext';
            case 'gitignore': return 'plaintext';
            case 'lock': return 'json';
            default: return 'plaintext';
        }
    };

    return (
        <div className="flex flex-col w-full h-1/2 lg:h-full gap-6 text-white">
            <div className="p-2 text-sm text-gray-400 border-b border-zinc-700">
                {selectedFilePath ? `Editing: ${selectedFilePath}` : "Select a file to edit"}
            </div>
            <Editor
                height="85vh"
                theme="vs-dark"
                language={getLanguage(selectedFilePath)}
                value={fileContent || ''}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    readOnly: !selectedFilePath,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                }}
            />

        </div>
    )
}

export default ZangetsuEditor;