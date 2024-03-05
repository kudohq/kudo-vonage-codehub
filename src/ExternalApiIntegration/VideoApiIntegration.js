import OT from "@opentok/client";

import { API_KEY, SESSION_ID, P_TOKEN, H_TOKEN } from "../config";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
let apiKey = API_KEY;
let sessionId = SESSION_ID;
let session, subscriber, publisher, panner;

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(setChunk, recorderRef, isHost) {
  let token = isHost ? H_TOKEN : P_TOKEN;
  if (session && session.isConnected()) {
    session.disconnect();
  }

  if (!session) {
    session = OT.initSession(apiKey, sessionId);
  }

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
    }
  });

  if(isHost){
      OT.getUserMedia({ audio: true })
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
  }

  // Subscribing to stream
  session.on("streamCreated", function (event) {
    const subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };

    session.subscribe(
      event.stream,
      "subscriber",
      subscriberOptions,
      handleError
    );
  });

  // Do some action on destroying the stream
  session.on("sessionDisconnected", function (event) {
    console.log("event in destroyed", event);
  });
}

export function stopStreaming() {
  session && session.unpublish(publisher);
}

// The following functions are used in functionality customization
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

function getAudioBuffer(buffer, audioContext) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(buffer, resolve, reject);
  });
}

function createAudioStream(audioBuffer, audioContext) {
  const startTime = audioContext.currentTime;

  const player = audioContext.createBufferSource();
  player.buffer = audioBuffer;
  player.start(startTime);

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

export function publish(translatedBuffer) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create audio stream from mp3 file and video stream from webcam
  Promise.all([
    translatedBuffer ? getAudioBuffer(translatedBuffer, audioContext) : null,
    OT.getUserMedia({ videoSource: null }),
  ])
    .then((results) => {
      const [audioBuffer] = results;
      const { audioStream, stop } = createAudioStream(
        audioBuffer,
        audioContext
      );

      // initialize the publisher
      if (!publisher) {
        const publisherOptions = {
          insertMode: "append",
          width: "100%",
          height: "100%",
          // Pass in the generated audio track as our custom audioSource
          audioSource: audioStream ? audioStream.getAudioTracks()[0] : null,
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
              }
            });
          }
        });
      } else {
        console.log("elseelseelselelse");
        // If publisher is already initialized, update the audio source
        publisher.publishAudio(false); // Stop publishing audio temporarily
        publisher.setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
        publisher.publishAudio(true); // Start publishing audio again
      }


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
