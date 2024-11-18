import React from 'react';

const VideoChat = ({ localVideoRef, remoteVideoRef }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-black rounded-lg overflow-hidden">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full" />
        <p className="text-white p-2">You</p>
      </div>
      <div className="bg-black rounded-lg overflow-hidden">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full" />
        <p className="text-white p-2">Partner</p>
      </div>
    </div>
  );
};

export default VideoChat;