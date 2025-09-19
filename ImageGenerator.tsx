
import React, { useState, useCallback } from 'react';
import { generateGameImage } from '../services/geminiService';
import { PROMPT_SUGGESTIONS } from '../constants';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(PROMPT_SUGGESTIONS[0].prompt);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateGameImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleSuggestionClick = (suggestionPrompt: string) => {
    setPrompt(suggestionPrompt);
  };
  
  return (
    <div className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left side: Controls */}
        <div>
          <label htmlFor="prompt-input" className="block text-lg font-semibold mb-2 text-gray-300">
            プロンプト (Prompt)
          </label>
          <p className="text-sm text-gray-500 mb-4">
            下のプロンプトを編集するか、提案ボタンから選んで画像を生成してください。
            (Edit the prompt below or choose a suggestion to generate an image.)
          </p>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-gray-200"
            placeholder="Enter your image prompt here..."
          />
          
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2 text-gray-400">提案 (Suggestions):</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="px-3 py-1 bg-gray-700 hover:bg-cyan-600 text-gray-200 text-sm rounded-full transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="w-full mt-6 py-3 px-6 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 text-lg shadow-md flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中... (Generating...)
              </>
            ) : "画像を生成 (Generate Image)"}
          </button>
        </div>

        {/* Right side: Display */}
        <div className="flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[300px] lg:min-h-full p-4">
          {isLoading && (
            <div className="text-center">
              <p className="text-gray-400 text-lg">AIが画像を生成中です...</p>
              <p className="text-gray-500 text-sm">しばらくお待ちください。(Please wait a moment.)</p>
              <div className="w-16 h-16 border-4 border-dashed border-cyan-500 rounded-full animate-spin mt-4 mx-auto"></div>
            </div>
          )}
          {error && <p className="text-red-400 text-center">{error}</p>}
          {generatedImage && (
            <img 
              src={generatedImage} 
              alt="Generated game concept art" 
              className="max-w-full max-h-full object-contain rounded-md shadow-lg"
            />
          )}
          {!isLoading && !error && !generatedImage && (
            <p className="text-gray-500 text-center">生成された画像がここに表示されます。(Your generated image will appear here.)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
