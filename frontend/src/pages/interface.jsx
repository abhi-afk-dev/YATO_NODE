import FileExplorer from "../components/file_explorer";
import { useState } from "react";
import Header from "../components/header";
import Terminal from "../components/terminal";
import ZangetsuEditor from "../components/zangetsu_editor";
import { webcontainerInstance } from '../components/api';

function Interface() {
    const [selectedFilePath, setSelectedFilePath] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const handleFileSelect = async (path) => {
        if (!webcontainerInstance) {
            console.error("WebContainer not ready to read file.");
            return;
        }
        setSelectedFilePath(path);
        const content = await webcontainerInstance.fs.readFile(path, 'utf-8');
        setFileContent(content);

    };

    const handleEditorChange = async (newContent) => {
        setFileContent(newContent);

        if (selectedFilePath && webcontainerInstance) {
            await webcontainerInstance.fs.writeFile(selectedFilePath, newContent);
            console.log(`File ${selectedFilePath} saved successfully.`);
        }
    }
    return (
        <div className="flex flex-col h-screen bg-[#1A1A1A]">
            <Header />
            <div className="flex flex row gap-2 w-full p-4">
                <FileExplorer onFileSelect={handleFileSelect} />

                <ZangetsuEditor
                    fileContent={fileContent}
                    onContentChange={handleEditorChange}
                    selectedFilePath={selectedFilePath}
                />
                <Terminal />
            </div>
        </div>
    );
}

export default Interface;