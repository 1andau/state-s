
import React, { useEffect, useRef, useState } from 'react';

const VideoPreview = ({ videoSrc }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);

  
  useEffect(() => {
    const video = videoRef.current;
    video.play();

    const resetVideo = () => {
      video.currentTime = 0;
      video.play();
    };

    const interval = setInterval(resetVideo, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        width="300"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: 'pointer' }}
        muted
        loop
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {isModalOpen && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>popa
          <video controls width="600">
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      )}
      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default VideoPreview;