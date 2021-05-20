import React, {useState, useEffect} from 'react';
import axios from 'axios';

let VideoList = () => {
    const [videos, setVideos] = useState([]);
    useEffect(async() => {
        let result = await axios.get("http://localhost:8080/videos");
        setVideos(result.data);
    });

    return (
        <div>
            {videos.map((video) => {
                return (
                    <div>{video.name}</div>
                )
            })}
        </div>
    );
}

export default VideoList;