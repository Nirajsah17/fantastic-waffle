import React, { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import { io } from 'socket.io-client';
import VideoChat from './components/VideoChat';
import ChatMessages from './components/ChatMessages';
import ChatModeSelector from './components/ChatModeSelector';

function App() {
  const [peer, setPeer] = useState(null);
  const [socket, setSocket] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [conn, setConn] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('disconnected');
  const [chatMode, setChatMode] = useState('video');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer();
    const newSocket = io('https://signal-latest.onrender.com');
    
    newPeer.on('open', (id) => {
      setPeerId(id);
      setStatus('ready');
    });

    newPeer.on('connection', (connection) => {
      setConn(connection);
      setupConnection(connection);
    });

    newPeer.on('call', async (call) => {
      if (chatMode === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localVideoRef.current.srcObject = stream;
          call.answer(stream);
          
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        } catch (err) {
          console.error('Error accessing media devices:', err);
          alert('Failed to access camera/microphone. Please ensure permissions are granted.');
        }
      }
    });

    newSocket.on('matched', async (partnerId) => {
      try {
        const connection = newPeer.connect(partnerId);
        setConn(connection);
        setupConnection(connection);

        if (chatMode === 'video') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localVideoRef.current.srcObject = stream;
          
          const call = newPeer.call(partnerId, stream);
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        }

        setStatus('connected');
      } catch (err) {
        console.error('Error in peer connection:', err);
        setStatus('disconnected');
      }
    });

    setPeer(newPeer);
    setSocket(newSocket);

    return () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      newPeer.destroy();
      newSocket.disconnect();
    };
  }, []);

  const setupConnection = (connection) => {
    connection.on('data', (data) => {
      if (typeof data === 'object' && data.type === 'mode') {
        if (status === 'connected') {
          setChatMode(data.mode);
        }
      } else {
        setMessages(prev => [...prev, { text: data, received: true }]);
      }
    });

    connection.on('open', () => {
      setStatus('connected');
      connection.send({ type: 'mode', mode: chatMode });
    });

    connection.on('close', () => {
      setStatus('disconnected');
      setConn(null);
      setMessages([]);
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    });
  };

  const findPartner = () => {
    if (status === 'connected' && conn) {
      conn.close();
    }
    setStatus('searching');
    socket?.emit('waiting', { peerId, mode: chatMode });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !conn) return;

    conn.send(message);
    setMessages(prev => [...prev, { text: message, received: false }]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">MQTT</h1>
          <ChatModeSelector 
            chatMode={chatMode} 
            setChatMode={setChatMode}
            status={status}
          />
          <p className="mb-4">Status: {status}</p>
          <button
            onClick={findPartner}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={status === 'searching'}
          >
            {status === 'searching' ? 'Searching...' : 'Find Partner'}
          </button>
        </div>

        {chatMode === 'video' && (
          <VideoChat 
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
          />
        )}

        <ChatMessages 
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          status={status}
        />
      </div>
    </div>
  );
}

export default App;