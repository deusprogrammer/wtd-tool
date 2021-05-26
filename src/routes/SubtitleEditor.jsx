import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import {createWebVttDataUri} from '../util/VideoTools';

let isTalking = false;
let currentIndex = -1;
let interval;

let SubtitleEditor = (props) => {
    const [videoSource, setVideoSource] = useState("");
    const [subs, setSubs] = useState([]);
    const [videoName, setVideoName] = useState("Video");
    const [currentSub, setCurrentSub] = useState(null);
    const [substitution, setSubstitution] = useState("");
    // const [currentIndex, setCurrentIndex] = useState(-1);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [muted, setMuted] = useState(false);

    const [videoLength, setVideoLength] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);

    const videoElement = React.createRef();

    const maleVoice = window.speechSynthesis.getVoices().find((element) => {
        return element.name === "Microsoft David Desktop - English (United States)";
    });

    const femaleVoice = window.speechSynthesis.getVoices().find((element) => {
        return element.name === "Microsoft Zira Desktop - English (United States)";
    });

    let setIsTalking = (b) => {
        isTalking = b;
    }

    let setCurrentIndex = (i) => {
        currentIndex = i;
    }

    let newSub = (startTime) => {
        setSubs([...subs, {
            startTime,
            endTime: startTime,
            text: ""
        }]);
        setCurrentSub((subs.length - 1) + 1);
    }

    let setStart = (startTime) => {
        let prev = [...subs];
        prev[currentSub] = {
            startTime,
            endTime: startTime,
            text: ""
        };
        setSubs(prev);
    }

    let setEnd = (endTime) => {
        let prev = [...subs];
        prev[currentSub] = {
            ...prev[currentSub],
            endTime
        };
        setSubs(prev);
    }

    let setText = (text) => {
        let prev = [...subs];
        prev[currentSub] = {
            ...prev[currentSub],
            text
        };
        setSubs(prev);
    }

    let onFileOpen = (e) => {
        let f = e.target.files[0];
        let fr = new FileReader();
        fr.onload = () => {
            setVideoSource(fr.result);
        }

        fr.readAsDataURL(f);
    }

    let convertSecondsToTimestamp = (seconds) => {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        let ms = Math.floor((seconds - Math.trunc(seconds)) * 1000);
    
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
    }

    let scrub = (seconds) => {
        videoElement.current.currentTime = seconds;
        setCurrentPosition(seconds);
    }

    let speak = (subtitle, text) => {
        let voice = null;

        setIsTalking(true);

        if (subtitle.text === "[male_dub]") {
            voice = maleVoice;
        } else {
            voice = femaleVoice;
        }
        
        let msg = new SpeechSynthesisUtterance();
        msg.voice = voice;
        msg.text = text;
        msg.onend = () => {
            setIsTalking(false);
            let ve = document.getElementById("videoElement");
            ve.play();
        }
        window.speechSynthesis.speak(msg);
    }

    let updateSubtitle = (video) => {
        setCurrentPosition(video.currentTime);
        let index = subs.findIndex((subtitle) => {
            return video.currentTime > subtitle.startTime && video.currentTime < subtitle.endTime;
        });

        if (index !== currentIndex) {
            if (isTalking) {
                video.pause();
                return;
            }

            if (currentIndex >= 0) {
                let currentSubtitle = subs[currentIndex];
                if (currentSubtitle.text === "[male_dub]" || currentSubtitle.text === "[female_dub]") {
                    setMuted(false);
                }
            }

            if (index >= 0) {
                let subtitle = subs[index];
                if (subtitle.text === "[male_dub]" || subtitle.text === "[female_dub]") {
                    setMuted(true);
                    if (substitution) {
                        speak(subtitle, substitution);
                    }
                }
                setCurrentSub(index);        
            }

            setCurrentIndex(index);
        }
    }

    // let handleFrame = (now, metadata) => {
    //     let video = document.getElementById("videoElement");
    //     updateSubtitle(video);

    //     // Re-register the callback to be notified about the next frame.
    //     video.requestVideoFrameCallback(handleFrame);
    // };

    let startListener = () => {
        interval = setInterval(() => {
            let video = document.getElementById("videoElement");
            if (video.paused) {
                return;
            }
            updateSubtitle(video);
        }, 1000/60);
    }

    let pauseListener = () => {
        clearInterval(interval);
    }

    let upload = async () => {
        try {
            setButtonsDisabled(true);
            let {_id} = await axios.post("https://deusprogrammer.com/api/img-svc/media", {
                title: videoName,
                mimeType: "video/mp4",
                imagePayload: videoSource.substring(videoSource.indexOf(',') + 1)
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": localStorage.getItem("accessToken")
                }
            });
            await axios.post("https://deusprogrammer.com/api/dubs/videos", {
                name: videoName,
                subtitles: subs,
                videoUrl: `https://deusprogrammer.com/api/img-svc/media/${_id}/file`
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": localStorage.getItem("accessToken")
                }
            });
            setButtonsDisabled(false);
            toast(`Video uploaded successfully!`, {type: "info"});
        } catch (error) {
            toast(`Video upload failed!`, {type: "error"});
        }
    }

    return (
        <div className="App">
            <ToastContainer />
            <h3>Twitch Editor</h3>
            { videoSource ?
                <div>
                    <div style={{display: "table", margin: "auto"}}>
                        <div style={{display: "table-cell", verticalAlign: "middle"}}>
                            <h3>Video</h3>
                            <video 
                                id="videoElement" 
                                ref={videoElement} 
                                width="300px" 
                                src={videoSource} 
                                muted={muted}
                                onPlay={() => {startListener()}}
                                onPause={() => {pauseListener()}}
                                onEnded={() => {pauseListener()}}
                                onCanPlayThrough={() => {setVideoLength(videoElement.current.duration);}}>
                                    <track label="English" kind="subtitles" srclang="en" src={createWebVttDataUri(subs, substitution)} default></track>
                            </video>
                            <div>
                                <button onClick={() => {scrub(Math.max(0, videoElement.current.currentTime - (1/60)))}}>&lt;</button>
                                <button onClick={() => {videoElement.current.play()}}>Play</button>
                                <button onClick={() => {videoElement.current.pause()}}>Pause</button>
                                <button onClick={() => {scrub(Math.min(videoElement.current.duration, videoElement.current.currentTime + (1/60)))}}>&gt;</button>
                            </div>
                            <div>
                                <input 
                                    type="range" 
                                    style={{width: "300px", padding: "0px", margin: "0px"}} 
                                    value={currentPosition} 
                                    step={1/60}
                                    max={videoLength}
                                    onChange={(e) => {scrub(e.target.value)}} />
                                <div style={{width: "300px", height: "25px", position: "relative"}}>
                                    <div style={{position: "absolute", left: currentPosition/videoLength * 300 + "px", width: "2px", height: "20px", backgroundColor: "black", zIndex: 9999}} />
                                    {subs.map((sub, index) => {
                                        return (
                                            <div 
                                            onClick={() => {
                                                setCurrentSub(index);
                                            }}
                                            style={{
                                                position: "absolute",
                                                left: (300 * (sub.startTime/videoLength)) + "px",
                                                width: (300 * ((sub.endTime - sub.startTime)/videoLength)) + "px",
                                                height: "20px",
                                                backgroundColor: "yellow",
                                                border: "1px solid black",
                                                cursor: "pointer"
                                            }}>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <label>Substitution</label><input type="text" value={substitution} onChange={(e) => {setSubstitution(e.target.value)}} />
                        </div>
                        <div style={{display: "table-cell"}}>
                            <div>
                                <label>Video Title</label><input type="text" value={videoName} onChange={(e) => {setVideoName(e.target.value)}} />
                            </div>
                            <div>
                                <h3>Current Subtitle</h3>
                                { currentSub !== null ?
                                    <table style={{margin: "auto"}}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {setStart(videoElement.current.currentTime)}}>Set Start</button>
                                                </td>
                                                <td>
                                                    <span>{convertSecondsToTimestamp(subs[currentSub].startTime)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {scrub(subs[currentSub].startTime)}}>Show Start</button>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {setEnd(videoElement.current.currentTime)}}>Set End</button>
                                                </td>
                                                <td>
                                                    <span>{convertSecondsToTimestamp(subs[currentSub].endTime)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {scrub(subs[currentSub].endTime)}}>Show End</button>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <label>Subtitle:</label>
                                                </td>
                                                <td>
                                                <input type="text" value={subs[currentSub].text} onChange={(e) => {setText(e.target.value)}} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    :
                                    null
                                }
                            </div>
                        </div>
                        <div style={{display: "table-cell"}}>
                            <h3>Subtitles</h3>
                            <div>
                                <table style={{margin: "auto"}}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Start</th>
                                            <th></th>
                                            <th>Stop</th>
                                            <th>Text</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        subs.map((sub, index) => {
                                            return (
                                                <tr 
                                                    style={{
                                                        cursor: "pointer", 
                                                        backgroundColor: index === currentSub ? "blue" : "white", 
                                                        color: index === currentSub ? "white" :"black"
                                                    }}
                                                    key={`sub${index}`}
                                                    className="subs"
                                                    onClick={() => {setCurrentSub(index); scrub(sub.startTime);}}>
                                                        <td>{index + 1}</td><td>{convertSecondsToTimestamp(sub.startTime)}</td><td>==&gt;</td><td>{convertSecondsToTimestamp(sub.endTime)}</td><td style={{width: "150px", textOverflow: "ellipsis"}}>{sub.text === "[male_dub]" || sub.text === "[female_dub]" ? sub.text  : `"${sub.text}"`}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                                <button type="button" onClick={() => {newSub(videoElement.current.currentTime)}}>New Subtitle</button>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <button type="button" onClick={() => {upload()}} disabled={buttonsDisabled}>Upload</button>
                </div>
                :
                <div>
                    <p>Please choose the video you wish to add subtitles to.  Note that the file needs to already be trimmed to the length you want it.</p>
                    <input type="file" accept=".mp4" onChange={onFileOpen} />
                </div>
            }
        </div>
    );
}

export default SubtitleEditor;
