import React from 'react';

const ChatModeSelector = ({ chatMode, setChatMode, status }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => setChatMode('video')}
        className={`px-4 py-2 rounded ${
          chatMode === 'video'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        disabled={status === 'connected'}
      >
        Video Chat
      </button>
      <button
        onClick={() => setChatMode('text')}
        className={`px-4 py-2 rounded ${
          chatMode === 'text'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        disabled={status === 'connected'}
      >
        Text Only
      </button>
    </div>
  );
};

export default ChatModeSelector;