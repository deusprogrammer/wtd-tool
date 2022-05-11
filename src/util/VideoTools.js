import {saveAs} from 'file-saver';
import JSZip from 'jszip';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export let convertSecondsToTimestamp = (seconds) => {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);
    let ms = Math.floor((seconds - Math.trunc(seconds)) * 1000);

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export let convertSecondsToAltTimestamp = (seconds) => {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    let ms = Math.floor((seconds - Math.trunc(seconds)) * 1000);

    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

export let convertSubtitlesToSrt = (subtitles) => {
    return subtitles.map((subtitle, index) => {
        return `${index + 1}\n${convertSecondsToTimestamp(subtitle.startTime)} --> ${convertSecondsToTimestamp(subtitle.endTime)}\n${subtitle.text}`;
    }).join("\n\n");
}

export let convertSubtitlesToWebVtt = (subtitles, substitution) => {
    if (!substitution || substitution === "") {
        substitution = "[Missing Audio]";
    }
    return "WEBVTT\n\n" + subtitles.map((subtitle) => {
        if (substitution && (subtitle.text === "[male_dub]" || subtitle.text === "[female_dub]")) {
            return `${convertSecondsToAltTimestamp(subtitle.startTime)} --> ${convertSecondsToAltTimestamp(subtitle.endTime)}\n${substitution}`;
        } else {
            return `${convertSecondsToAltTimestamp(subtitle.startTime)} --> ${convertSecondsToAltTimestamp(subtitle.endTime)}\n${subtitle.text}`;
        }
    }).join("\n\n");
}

export let createWebVttDataUri = (subtitles, substitution) => {
    return "data:text/vtt;base64," + btoa(convertSubtitlesToWebVtt(subtitles, substitution));
}

export let createPayloadZip = async (base64ByteStream, subtitles, title, clipNumber = 1, type) => {
    let zip = new JSZip();
    let folderName = "WhatTheDub_Data";

    if (type === "rifftrax") {
        folderName = "RiffTraxTheGame_Data";
    }

    let root = zip
        .folder(folderName)
        .folder("StreamingAssets");

    let baseFileName = title ? title.replace(" ", "_") + `-Clip${`${clipNumber}`.padStart(3, "0")}` : `${uuidv4()}`;
    
    root
        .folder("Subtitles")
        .file(`${baseFileName}.srt`, convertSubtitlesToSrt(subtitles));
    root
        .folder("VideoClips")
        .file(`${baseFileName}.mp4`, base64ByteStream, {base64: true});

    let content = await zip.generateAsync({type:"blob"});
    saveAs(content, baseFileName + ".zip")
}