import OT from "@opentok/client";

import { API_KEY, SESSION_ID, TOKEN } from "../config";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import funkloop from "../assets/fastCount.mp3"
let apiKey = API_KEY;
let sessionId = SESSION_ID;
let token = TOKEN;
let session, subscriber, publisher, panner;

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(setChunk, recorderRef) {
  if (session && session.isConnected()) {
    session.disconnect();
  }
  session = OT.initSession(apiKey, sessionId);

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
    }
  });
  // Subscribing to stream
  session.on("streamCreated", function (event) {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    };
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {

          recorderRef.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/wav",
            recorderType: StereoAudioRecorder,
            timeSlice: 1000,
            ondataavailable: function (data) {
              setChunk(data);
            },
          });
          recorderRef.current.startRecording();
  
        })
        .catch(function (error) {
          console.error("Error accessing microphone:", error);
        });
    
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  // Do some action on destroying the stream
  session.on("sessionDisconnected", function (event) {
    console.log("event in destroyed", event);
  });
}

export function stopStreaming() {
  session && session.unpublish(publisher);
}

// The following functions are used in functionlaity customization
export function toggleVideo(state) {
  publisher.publishVideo(state);
}
export function toggleAudio(state) {
  publisher.publishAudio(state);
}
export function toggleAudioSubscribtion(state) {
  subscriber.subscribeToAudio(state);
}
export function toggleVideoSubscribtion(state) {
  subscriber.subscribeToVideo(state);
}

function getAudioBuffer(url, audioContext) {
  return fetch(url)
    .then((res) => {

      return res.arrayBuffer();
    }
    )
    .then(
      (audioData) =>
        new Promise((resolve, reject) => {
          audioContext.decodeAudioData(audioData, resolve, reject);
        })
    );
}

function createAudioStream(audioBuffer, audioContext) {
  const startTime = audioContext.currentTime;

  const player = audioContext.createBufferSource();
  player.buffer = audioBuffer;
  player.start(startTime);
  player.loop = true;

  const destination = audioContext.createMediaStreamDestination();
  panner = audioContext.createStereoPanner();
  panner.pan.value = 0;
  panner.connect(destination);
  player.connect(panner);
  return {
    audioStream: destination.stream,
    stop() {
      player.disconnect();
      player.stop();
    },
  };
}

export function publish() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create audio stream from mp3 file and video stream from webcam
  Promise.all([
    getAudioBuffer(funkloop, audioContext),
    OT.getUserMedia({ videoSource: null }),
  ])
    .then((results) => {
      const [audioBuffer, videoStream] = results;
      const { audioStream, stop } = createAudioStream(
        audioBuffer,
        audioContext
      );

      // initialize the publisher
      const publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        videoSource: videoStream.getVideoTracks()[0],
        // Pass in the generated audio track as our custom audioSource
        audioSource: audioStream.getAudioTracks()[0],
        // Enable stereo audio
        enableStereo: true,
        // Increasing audio bitrate is recommended for stereo music
        audioBitrate: 128000,
      };
      publisher = OT.initPublisher("publisher", publisherOptions, (error) => {
        if (error) {
          handleError(error);
        } else {
          // If the connection is successful, publish the publisher to the session
          session.publish(publisher, (error) => {
            if (error) {
              handleError(error);
              console.log("publisher error", error)
            }
          });
        }
      });

      publisher.on("destroyed", () => {
        // When the publisher is destroyed we cleanup
        stop();
        audioContext.close();
      });
    })
    .catch((error) => {
      audioContext.close();
      throw error;
    });
}