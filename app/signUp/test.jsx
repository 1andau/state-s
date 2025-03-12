"use client";
export default function Home() {
return(
<>
<div className={styles.container}>
      <h1>Video Upload and Display</h1>
      <VideoUploader onUploadSuccess={handleUploadSuccess} />
      <div className={styles.videoGrid}>
        {videos.map((video, index) => (
          <div className={styles.videoItem}
          key={video.uid}
          >
          <VideoPlayer
          className={styles.videoHoldOn}
            key={index}
            videoUrl={video.playback.hls} // Используем HLS
            thumbnailUrl={video.thumbnail}
            preview={video.preview}

          />
          </div>

        ))}
      </div>
    </div>
</>
)
}

//page.modules.css
.videoGrid{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 20px; 
}

.videoItem{
  text-align: center;
  color: #fff;
  flex: 1 0 30%; 
  max-width: 30%; 
  box-sizing: border-box;
}

.videoHoldOn{
  width: 100%;
  border-radius: 50%;
  object-fit: cover;
  aspect-ratio: 1; 
}



