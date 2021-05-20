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
    }, []);

    return (
        <div>
            <h3>Video List</h3>
            {videos.map((video) => {
                return (
                    <div><a href={`https://deusprogrammer.com/api/dubs/videos/${video._id}/zip`} download>{video.name}</a></div>
                )
            })}
        </div>
    );
}

export default VideoList;