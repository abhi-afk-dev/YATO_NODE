import { WebContainer } from '@webcontainer/api';

export let webcontainerInstance;
let outputCallback = (output) => console.log(output);
let shellWriter;

const stripAnsiCodes = (str) => {
    return str.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
};

export const setOutputCallback = (callback) => {
    outputCallback = (rawOutput) => {
        let cleanOutput = String(rawOutput);
        if (cleanOutput.length > 1 && cleanOutput.startsWith('"') && cleanOutput.endsWith('"')) {
            cleanOutput = cleanOutput.substring(1, cleanOutput.length - 1);
        }
        cleanOutput = stripAnsiCodes(cleanOutput);
        cleanOutput = cleanOutput.trimEnd();
        callback(cleanOutput);
    };
};

export const initializeWebContainer = async () => {
    if (webcontainerInstance) {
        outputCallback("WebContainer already booted. Skipping initialization.");
        return;
    }

    outputCallback("Booting WebContainer.....");

    webcontainerInstance = await WebContainer.boot();
    outputCallback("WebContainer booted successfully!");


    outputCallback("Starting terminal shell...");
    const shellProcess = await webcontainerInstance.spawn('jsh', {
    });

    shellWriter = shellProcess.input.getWriter();

    shellProcess.output.pipeTo(new WritableStream({
        write(chunk) {
            let processedChunk = chunk;
            if (chunk instanceof Uint8Array) {
                processedChunk = new TextDecoder().decode(chunk);
            } else {
                console.warn('Warning: Chunk is already a string from shell output. Using as-is.');
            }
            outputCallback(String(processedChunk));
        }
    }));

    shellProcess.exit.then((exitCode) => {
        outputCallback(`Shell exited with code: ${exitCode}`);
        shellWriter = null; 
        webcontainerInstance = null;
    });
    await shellWriter.write('export PATH="$PATH:./node_modules/.bin"\n');
    outputCallback("Shell PATH configured.");

    outputCallback("Terminal shell ready!");
    outputCallback("WebContainer is ready!");
    outputCallback("To start a new project, use a command like:");
    outputCallback("  - For React (Vite): npm create vite@latest my-react-app -- --template react --yes");
    outputCallback("  - For Angular: npm create vite@latest my-angular-app -- --template angular --yes");
    outputCallback("  - For Vue: npm create vite@latest my-vue-app -- --template vue --yes");
    outputCallback("Or explore with 'ls' (it will be empty initially).");



};

export const executeCommand = async (commandLine) => {
    if (!webcontainerInstance || !shellWriter) {
        outputCallback("Terminal not fully initialized. Please wait.");
        return 1;
    }

    const trimmedCommandLine = commandLine.trim();
    if (!trimmedCommandLine) {
        outputCallback("No command entered.");
        return 0;
    }

    await shellWriter.write(`${trimmedCommandLine}\n`);

    return 0;
};
