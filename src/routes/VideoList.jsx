import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {saveAs} from 'file-saver';
import {Link} from 'react-router-dom';

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

    let getZip = async (id, name) => {
        let zip = await axios.get(`https://deusprogrammer.com/api/dubs/videos/${id}/zip`, {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });
        saveAs(zip.data.dataUri, `${name}.zip`);
    }

    return (
        <div>
            <h3>Video List</h3>
            {videos.map((video) => {
                return (
                    <div>
                        {video.name}&nbsp;
                        <button type="button" onClick={() => {navigator.clipboard.writeText(video._id)}}>Get ID</button>
                        <button type="button" onClick={() => {getZip(video._id, video.name)}}>Download Zip</button>
                        <Link to={`${process.env.PUBLIC_URL}/videos/${video._id}`}><button type="button">Open Details</button></Link>
                    </div>
                )
            })}
        </div>
    );
}

export default VideoList;