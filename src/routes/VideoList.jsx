import React, {useState, useEffect} from 'react';
import axios from 'axios';

let VideoList = () => {
    const [videos, setVideos] = useState([]);
    useEffect(async() => {
        let result = await axios.get("https://deusprogrammer.com/api/dubs/videos", {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });
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