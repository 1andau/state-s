"use client";
import styles from "./upload.module.css";


const VideoUpload = ({ onUpload }) => {

    

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      const video = document.createElement('video');
      video.preload = 'metadata';
  
      video.onloadedmetadata = () => {
        if (video.duration > 30) {
          alert('Видео должно быть не длиннее 30 секунд.');
        } else {
          onUpload(file);
        }
      };
  
      video.src = URL.createObjectURL(file);
    };
  
    return (
        <>
     <input type="file" accept="video/*" onChange={handleFileChange} />

        </>
    );
  };
  
  export default VideoUpload;