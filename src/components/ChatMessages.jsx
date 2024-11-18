import React from 'react';

const ChatMessages = ({ messages, message, setMessage, sendMessage, status }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="h-64 overflow-y-auto mb-4 p-4 border rounded">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${msg.received ? 'text-left' : 'text-right'}`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.received ? 'bg-gray-200' : 'bg-blue-500 text-white'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Type a message..."
          disabled={status !== 'connected'}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={status !== 'connected'}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatMessages;