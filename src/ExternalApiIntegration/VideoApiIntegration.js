import OT from "@opentok/client";

import { API_KEY, SESSION_ID, P_TOKEN, S_TOKEN } from "../config";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
let apiKey = API_KEY;
let sessionId = SESSION_ID;
let session, subscriber, publisher1, publisher2, panner;

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(
  setChunk,
  recorderRef,
  isHost,
  SelectedLanguage
) {
  let token = isHost ? P_TOKEN : S_TOKEN;
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

  if (isHost) {
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
    if (SelectedLanguage === event.stream.name) {
      session.subscribe(
        event.stream,
        "subscriber",
        subscriberOptions,
        handleError
      );
      console.log("subscriber", event);
    }
  });
  // Do some action on destroying the stream
  session.on("sessionDisconnected", function (event) {
    console.log("event in destroyed", event);
  });
}

export function stopStreaming() {
  if (session) {
    session.unpublish(publisher1);
    session.unpublish(publisher2);
  }
}

// The following functions are used in functionality customization
export function toggleVideo(state) {
  publisher1.publishVideo(state);
  publisher2.publishVideo(state);
}
export function toggleAudio(state) {
  publisher1.publishAudio(state);
  publisher2.publishAudio(state);
}
export function toggleAudioSubscribtion(state) {
  subscriber.subscribeToAudio(state);
}
export function toggleVideoSubscribtion(state) {
  subscriber.subscribeToVideo(state);
}

export function togglePublisherDestroy(state) {
  publisher1.disconnect();
  publisher2.disconnect();
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

export function publish(translatedBuffer, targetLanguage) {
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
      if (!publisher1) {
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
          name: "HIN",
        };
        console.log("publisher 1 if");
        publisher1 = OT.initPublisher(
          "publisher",
          publisherOptions,
          (error) => {
            if (error) {
              handleError(error);
            } else {
              // If the connection is successful, publish the publisher1 to the session
              session.publish(publisher1, (error) => {
                if (error) {
                  handleError(error);
                }
              });
            }
          }
        );
        publisher2 = OT.initPublisher(
          "publisher",
          { ...publisherOptions, name: "CHI" },
          (error) => {
            if (error) {
              handleError(error);
            } else {
              // If the connection is successful, publish the publisher1 to the session
              session.publish(publisher2, (error) => {
                if (error) {
                  handleError(error);
                }
              });
            }
          }
        );
      } else {
        console.log("elseelseelselelse");
        // If publisher1 is already initialized, update the audio source
        if (targetLanguage === "HIN") {
          console.log("publisher 1 else");
          publisher1.publishAudio(false); // Stop publishing audio temporarily
          publisher1.setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
          publisher1.publishAudio(true); // Start publishing audio again
        }
        // If publisher2 is already initialized, update the audio source
        if (targetLanguage === "CHI") {
          publisher2.publishAudio(false); // Stop publishing audio temporarily
          publisher2.setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
          publisher2.publishAudio(true); // Start publishing audio again
        }
      }

      // publisher1.on("destroyed", () => {
      //   // When the publisher is destroyed we cleanup
      //   stop();
      //   audioContext.close();
      // });
      // publisher2.on("destroyed", () => {
      //   // When the publisher is destroyed we cleanup
      //   stop();
      //   audioContext.close();
      // });
    })
    .catch((error) => {
      audioContext.close();
      throw error;
    });
}
