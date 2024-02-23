// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from "react-use-websocket";
import { useCallback, useEffect, useState } from "react";
import { saveAs } from "file-saver";

export const WebsocketConnection = ({ dataBlobUrl }) => {
  const SERVER_URL =
    "wss://external-api-staging.meetkudo.com/api/v1/translate?id=d5c3c200-ce99-4f4c-8f39-abdbf523d8ad";
  const API_TOKEN =
    "eyJraWQiOiIwSGkrOHhFbTV3NlwvN21NdmdkXC9YQThHYzdmSitwMUpYQTM3SjdCOVhiRkU9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3dTAwNmh1bWZxMXY4c2VuNmdiMGZmNXZtaiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoic2hhcmVkLXNlcnZpY2VzXC9zZXJ2aWNlIiwiYXV0aF90aW1lIjoxNzA4NjgzOTYzLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9lUFNxNjlpQ3kiLCJleHAiOjE3MDg3NzAzNjMsImlhdCI6MTcwODY4Mzk2MywidmVyc2lvbiI6MiwianRpIjoiODM2YWQxZGUtZTE0Zi00MmE5LWJkY2YtZWMwMmRjYzY3ZGRiIiwiY2xpZW50X2lkIjoiN3UwMDZodW1mcTF2OHNlbjZnYjBmZjV2bWoifQ.kC-mRwg8L6KT3KRoUlWKxRcM-57s9vMXHx7TwfTMC1u8x4vaYOhu1A2ZZ4zkaVfAQRzJivzAYWY5gvmk6FZpbSzk921FiXm5sx5gA_fUAikWm6DdWUPu1OGiCGWHD9NO9DGYl70DM-l-ESyqMQiSygqYMSQcY23qVhiVSZE1qMBzN4_LNcbAWip9smFzjeX7jYxxNc6CaUl2oR-k1q3PyWTdcle9qAZJsIkaUSSRMSzjYT962vzzKyNo55Gkzbk8EWEHWneiJH-pfOpS28nM6wxOmEi5wnFIvTCShEh2aprCcYPDIHxnUjtgjnAZbIqOQ10kEpVKKiQrScpNwAkL2Q"
      const [binaryData, setBinaryData] = useState("audio/wav;base64,");

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

  const { sendMessage } = useWebSocket(SERVER_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (message) => {
      let data = JSON.parse(message.data);
      console.log("Translating your audio...");
      console.log("Websocket response", data);

      setBinaryData((prev) => prev + data.audioData);
    },
    onClose: (e) => {
      var binary = convertDataURIToBinary(binaryData);
      var blob = new Blob([binary], { type: "audio/wav" });
      saveAs(blob, "audio-output.ogg");

      console.log("closed", e);
    },
    onError: (e) => console.error("Error in websocket", e),
    share: true,
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
