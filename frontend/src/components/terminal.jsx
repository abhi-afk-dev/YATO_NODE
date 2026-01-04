import {
  executeCommand,
  initializeWebContainer,
  setOutputCallback,
} from "../components/api";
import { useState, useEffect } from "react";
import AppPreview from "./app_preview";
function Terminal() {
  const [result, setResult] = useState([]);
  const [inputcommand, setInputCommand] = useState("");

  const appendToResult = (newItem) => {
    setResult((prevResult) => {
      return [...prevResult, newItem];
    });
  };

  useEffect(() => {
    setOutputCallback(appendToResult);
    initializeWebContainer();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const commandToExecute = inputcommand.trim();

      if (commandToExecute === "clear" || commandToExecute === "cls") {
        setResult([]);
        setInputCommand("");
        return;
      }

      if (!commandToExecute) {
        setInputCommand("");
        return;
      }
      appendToResult(`> ${commandToExecute}`);
      executeCommand(commandToExecute);
      setInputCommand("");
    }
  };

  const handleCreateProject = (framework) => {
    let command = "";
    const projectName = `my-${framework.toLowerCase()}-app`;

    if (framework === "React") {
      command = `npm create -y vite@5 ${projectName} -- --template react`;
    } else if (framework === "Angular") {
      command = `npm create -y vite@latest ${projectName} -- --template angular --y`;
    } else if (framework === "Vue") {
      command = `npm create -y vite@latest ${projectName} -- --template vue --y`;
    } else {
      appendToResult(`Error: Unknown framework '${framework}'.`);
      return;
    }

    appendToResult(`> ${command}`);
    executeCommand(command);
  };
  return (
    <div className="w-1/3 h-full flex flex-col gap-2">
      <AppPreview />
      <div className="w-full bg-[#1A1A1A] flex flex-wrap justify-between gap-2 text-white p-4 rounded border border-zinc-600 gap-2">
        <h3 className="text-lg font-semibold mb-2">Create New Project:</h3>
        <div className="flex gap-1">
          <button
            onClick={() => handleCreateProject("React")}
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            R
          </button>
          <button
            onClick={() => handleCreateProject("Angular")}
            className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
          >
            A
          </button>
          <button
            onClick={() => handleCreateProject("Vue")}
            className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
          >
            V
          </button>
        </div>
      </div>

      <form className="w-full bg-[#1A1A1A] flex flex-col custom-scrollbar text-white p-4 rounded border border-zinc-600">
        <label>Command:</label>
        <input
          type="text"
          className="w-full h-15 bg-zinc-800 text-white p-2 rounded-lg outline-none"
          placeholder="Type your command here..."
          value={inputcommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
      <div className="w-full h-100 flex-grow bg-[#1A1A1A] flex flex-col text-white p-4 rounded border border-zinc-600 overflow-hidden">
        <pre
          style={{ whiteSpace: "pre-wrap" }}
          className="w-full flex flex-col-reverse custom-scrollbar overflow-auto h-full bg-zinc-800 text-green-600 p-2 rounded outline-none"
        >
          <code>
            {result.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default Terminal;
