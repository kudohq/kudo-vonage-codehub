// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from "react-use-websocket";
import { useCallback, useEffect, useState } from "react";
import { saveAs } from "file-saver";

export const WebsocketConnection = ({
  dataBlobUrl,
  translatedBuffer,
  setTranslatedBuffer,
  isInterviewStarted,
}) => {
  const SERVER_URL =
    "wss://external-api-staging.meetkudo.com/api/v1/translate?id=d5c3c200-ce99-4f4c-8f39-abdbf523d8ad";
  const API_TOKEN =
    "eyJraWQiOiIwSGkrOHhFbTV3NlwvN21NdmdkXC9YQThHYzdmSitwMUpYQTM3SjdCOVhiRkU9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3dTAwNmh1bWZxMXY4c2VuNmdiMGZmNXZtaiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoic2hhcmVkLXNlcnZpY2VzXC9zZXJ2aWNlIiwiYXV0aF90aW1lIjoxNzA5MjkxODk0LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9lUFNxNjlpQ3kiLCJleHAiOjE3MDkzNzgyOTQsImlhdCI6MTcwOTI5MTg5NCwidmVyc2lvbiI6MiwianRpIjoiNGMxMjc4MjYtNGE2MC00NmZmLTg0ZmMtNWM3MzhhZTY2ZmJmIiwiY2xpZW50X2lkIjoiN3UwMDZodW1mcTF2OHNlbjZnYjBmZjV2bWoifQ.gRAvSzQfeixeN9V4LUvfJ8Dv8ER0-hHJDhsm1W6UQIuO6o0WLAZzrgMb_9_FLIxo_doNMdbs1xzgZdQqPXJREE6qzYqzzAhRZZCOufTd0UbnIFzLZuydGB9z3hw6rrs2YUQV6Vg85keXv1k4LOMNbyqa4EED14f0e0xtuejFhAUUO_qBQhTl-UkB6lS9Q9IGPKlyBX8q1eQPFx9t5mgKTzc3QZfwmWnOnoTYziD5EDKFctxhWyDlnJuuPhPvcS_EmnNhZWMKDrreCRyo1tpM2DbbzJtqy6UImB0hKrMNG4JMKU5u-WHeNnRiSUmf6Uc7YFX9Af99Q_hyJg1fxDW4_w";
  const [binaryData, setBinaryData] = useState("audio/wav;base64,");
  const [index, setIndex] = useState(0);
  // converting the data to valid binary format
  function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ";base64,";
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  const { getWebSocket, sendMessage } = useWebSocket(SERVER_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (message) => {
      let data = JSON.parse(message.data);
      console.log("Translating your audio...");
      console.log("Websocket response", data);

      setBinaryData((prev) => prev + data.audioData);
      var data1 = "audio/wav;base64," + data.audioData;
      var bufferData = convertDataURIToBinary(data1);
      var audioBlob = new Blob([bufferData], { type: "audio/wav" });

      var reader = new FileReader();
      reader.onload = function (event) {
        var audioData = event.target.result;

          setTranslatedBuffer((prevData) => ({
            ...prevData,
            [index]: audioData,
          }));
      };
      reader.readAsArrayBuffer(audioBlob);
      setIndex((prevIndex) => prevIndex + 1); // Increment index by 1
      if(!isInterviewStarted){
        getWebSocket().close();
      }

    },
    onClose: (e) => {
      var binary = convertDataURIToBinary(binaryData);
      var blob = new Blob([binary], { type: "audio/wav" });
      saveAs(blob, "audio-output.ogg");

      console.log("closed", e);
    },
    onError: (e) => console.error("Error in websocket", e),
    shouldReconnect: () => false,
    protocols: ["Authorization", API_TOKEN],
  });

  // converting audio blob to float32array and send to websocket
  const convertBlobToArray = useCallback(async () => {
    const arrayBuffer = await dataBlobUrl.arrayBuffer();

    const dataView = new DataView(arrayBuffer);
    const pcmData = new Float32Array(arrayBuffer.byteLength / 4);

    for (let i = 0; i < pcmData.length; i++) {
      pcmData[i] = dataView.getInt16(i * 4, true);
    }
    sendMessage(JSON.stringify(pcmData));
  }, [dataBlobUrl, sendMessage]);

  // render convertBlobToArray function for every chunk of data
  useEffect(() => {
    convertBlobToArray();
  }, [dataBlobUrl, convertBlobToArray]);
};
