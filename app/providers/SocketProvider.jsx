"use client";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "INITIAL_VIDEOS") {
        setVideos(data.videos);
      } 
      else if (data.type === "UPDATE_VIDEOS") {
        setVideos(prev => {
          // Обновляем только изменившиеся видео
          const updated = [...prev];
          data.videos.forEach(newVideo => {
            const index = updated.findIndex(v => v.uid === newVideo.uid);
            if (index >= 0) {
              updated[index] = newVideo;
            } else {
              updated.unshift(newVideo);
            }
          });
          return updated;
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => ws.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, videos, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);