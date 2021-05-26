import React, {useState, useEffect} from 'react';
import {createWebVttDataUri} from '../util/VideoTools';

let isTalking = false;
let currentIndex = -1;
let interval;

export default (props) => {
    const [muted, setMuted] = useState(false);

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

    let startListener = () => {
        interval = setInterval(() => {
            if (videoElement.current.paused) {
                return;
            }
            updateSubtitle(video.current);
        }, 1000/60);
    }

    let pauseListener = () => {
        clearInterval(interval);
    }

    return (
        <div>
            { videoSource ?
                <video 
                    id="videoElement" 
                    ref={videoElement} 
                    width="300px" 
                    src={props.videoSource} 
                    muted={muted}
                    onPlay={() => {startListener()}}
                    onPause={() => {pauseListener()}}
                    onEnded={() => {pauseListener()}}>
                        <track label="English" kind="subtitles" srclang="en" src={createWebVttDataUri(props.subs, props.substitution)} default></track>
                </video> : null
            }               
        </div>
    );
}