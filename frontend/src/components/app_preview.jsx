import { useState,useEffect } from "react";
import { webcontainerInstance } from './api';

function AppPreview() {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    
        useEffect(() => {
            let cleanupListener;
    
            const setupListener = () => {
                if (webcontainerInstance) {
                    const listener = (port, url) => {
                        console.log(`WebContainer server ready on port ${port}: ${url}`);
                        setPreviewUrl(url);
                    };
                    webcontainerInstance.on('server-ready', listener);
                    cleanupListener = () => {
                        webcontainerInstance.off('server-ready', listener);
                    };
                }
            };
    
            setupListener();
    
            const intervalId = setInterval(setupListener, 500);
    
            return () => {
                clearInterval(intervalId);
                if (cleanupListener) {
                    cleanupListener();
                }
            };
        }, []);
    
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className="w-full h-70 bg-zinc-900 text-white p-4 rounded-lg border border-zinc-600 flex flex-col relative">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
                    App Preview
                    {previewUrl && (
                        <button
                            onClick={toggleFullScreen}
                            className="p-1 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors text-sm"
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            {isFullScreen ? ' shrink ' : ' ⚡ '}
                        </button>
                    )}
                </h3>
                {previewUrl ? (
                    <iframe
                        src={previewUrl}
                        title="App Preview"
                        className="flex-1 w-full h-full border-none rounded-md bg-white"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    ></iframe>
                ) : (
                    <p className="text-center text-gray-400">Run 'npm run dev' in the terminal to start the app preview.</p>
                )}
            </div>

            {isFullScreen && previewUrl && (
                <div className="fixed inset-0 bg-zinc-950 bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
                    <div className="w-full h-full max-w-screen-xl max-h-screen-xl bg-zinc-900 rounded-lg overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-3 bg-zinc-800 border-b border-zinc-700">
                            <h3 className="text-lg font-semibold">App Preview (Full Screen)</h3>
                            <button
                                onClick={toggleFullScreen}
                                className="py-1 px-6 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors text-sm"
                                title="Exit Full Screen"
                            >
                                Close
                            </button>
                        </div>
                        <iframe
                            src={previewUrl}
                            title="App Preview Full Screen"
                            className="flex-1 w-full h-full border-none bg-white"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        ></iframe>
                    </div>
                </div>)}
        </div>
    )

}

export default AppPreview;