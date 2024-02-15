import OT from "@opentok/client";
import { API_KEY, SESSION_ID, TOKEN } from "../config";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
let apiKey = API_KEY;
let sessionId = SESSION_ID;
let token = TOKEN;
let session, subscriber, publisher;

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(setChunk, recorderRef) {
  session = OT.initSession(apiKey, sessionId);
   
  publisher = OT.initPublisher(
      "publisher",
      {
        insertMode: "append",
        style: { buttonDisplayMode: "off" },
        width: "100%",
        height: "100%",
        insertDefaultUI: true,
        publishAudio: true,
      },
      handleError
    );
  // Connect to the session
  session.connect(token, function (error) {
    // Create a publisher

    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          // console.log(stream, "streamsss");

          recorderRef.current = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/wav",
            recorderType: StereoAudioRecorder,
            timeSlice: 1000,
            ondataavailable: function (data) {
              // console.log(data, "chunk data");
              setChunk(data);
            },
          });
          recorderRef.current.startRecording();
  
        })
        .catch(function (error) {
          console.error("Error accessing microphone:", error);
        });
    }
  });

  // Subscribing to stream
  session.on("streamCreated", function (event) {
    console.log("stream created", event);
    subscriber = session.subscribe(
      event.stream,
      "subscriber",
      {
        insertMode: "append",
        style: { buttonDisplayMode: "off" },
        width: "100%",
        height: "100%",
        publishAudio: true,
      },
      handleError
    );

  });

  // Do some action on destroying the stream
  session.on("streamDestroyed", function (event) {
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