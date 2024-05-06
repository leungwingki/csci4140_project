const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
var sdk = SpeechSDK;
let userMessage = null; // Variable to store user's message
const API_KEY = "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"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;
var transcript="";

//refer to recorder.js
let recorder = new Recorder();

var blob;
function runSpeechRecognition() {
  const speechKey = "64940cd9e1f14ac2a55323e46573a930";
  const speechRegion = "eastasia";

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = "en-US";

  const referenceText = transcript;

  const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );

  console.log(recorder.getWAVBlob()); 
//pass the audio t azure
  let audioConfig = sdk.AudioConfig.fromWavFileInput(recorder.getWAVBlob());

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationAssessmentConfig.applyTo(recognizer);

  function onRecognizedResult(result) {
    //console.log("Pronunciation assessment for:", result.text);
    const pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(result);

    //console.log("Word-level details:");

  }

  recognizer.recognized = (s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
      onRecognizedResult(e.result);
    }
  };

  //   recognizer.startContinuousRecognitionAsync(
  //     () => {
  //       console.log("Recognition started...");
  //     },
  //     (error) => {
  //       console.error("Failed to start recognition:", error);
  //     }
  //   );

  setTimeout(() => {
    recognizer.stopContinuousRecognitionAsync(
      () => {
        console.log("Recognition stopped.");
        recognizer.close();
      },
      (error) => {
        console.error("Failed to stop recognition:", error);
        recognizer.close();
      }
    );
  }, 60 * 1000);
}

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // return chat <li> element
};

const generateResponse = (chatElement) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const messageElement = chatElement.querySelector("p");

  // Define the properties and message for the API request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    }),
  };

  let synth = speechSynthesis;

  function textToSpeech(text) {
    let utterance = new SpeechSynthesisUtterance(text);
  
    // Get the desired voice
    const voices = synth.getVoices();
    const googleUSVoice = voices.find(voice => voice.name === 'Samantha');
  
    // Set the voice for the utterance
    utterance.voice = googleUSVoice;
  
    synth.speak(utterance);
  }

  // Send POST request to API, get response and set the reponse as paragraph text
  fetch(API_URL, requestOptions)
    .then((res) => res.json())
    .then((data) => {
      if(transcript!=userMessage){
        messageElement.textContent = data.choices[0].message.content.trim()+"\n ---Pronunciation Result---\n"+"Ummm...Not a good pronunciation. Follow me and practice!\n";

        // Create a button element
        const button = document.createElement('button');
        button.textContent = 'Click here to listen the correct pronunciation';
        // Add event listener to the button
        button.addEventListener('click', () => {
          // Handle button click event
          console.log("Button clicked");
          textToSpeech(userMessage);
        });

        // Append the button to the messageElement
        messageElement.appendChild(button);
      }else{
        messageElement.textContent = data.choices[0].message.content.trim()+"\n ---Pronunciation Result---\n"+"Good Job! Keep going on";
      }
      //messageElement.textContent = data.choices[0].message.content.trim();
    })
    .catch(() => {
      messageElement.classList.add("error");
      messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};


const handleChat = () => {
  runSpeechRecognition();
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);


};

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

click_to_record.addEventListener("click", function () {
  var speech = true;
  window.SpeechRecognition = window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.lang = "en-US";


  recognition.addEventListener("result", (e) => {
    transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    // replace chat
    document.getElementById("convert_text").value = transcript;
    console.log(`identified：${transcript}`);
  });

  if (speech == true) {
    recognition.start();
    recorder.start();
    stateIndex = 1;
    application(stateIndex);
  }
});

//recording
// collect DOMs
const display = document.querySelector(".display");
const controllerWrapper = document.querySelector(".controllers");

const State = ["Initial", "Record", "Download"];
let stateIndex = 0;
let mediaRecorder,
  chunks = [],
  audioURL = "";


// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//   console.log("mediaDevices supported..");

//   navigator.mediaDevices
//     .getUserMedia({
//       audio: true,
//     })
//     .then((stream) => {
//       mediaRecorder = new MediaRecorder(stream);

//       mediaRecorder.ondataavailable = (e) => {
//         chunks.push(e.data);
//       };

//       mediaRecorder.onstop = () => {
//         const blob = new Blob(chunks, { type: "audio/wav" });
//         chunks = [];
//         audioURL = window.URL.createObjectURL(blob);
//         document.querySelector("audio").src = audioURL;
//       };
//     })
//     .catch((error) => {
//       console.log("Following error has occured : ", error);
//     });
// } else {
//   stateIndex = "";
//   application(stateIndex);
// }

const clearDisplay = () => {
  display.textContent = "";
};

const clearControls = () => {
  controllerWrapper.textContent = "";
};

const stopRecording = () => {
  stateIndex = 2;
  recorder.stop();
  audioURL = window.URL.createObjectURL(recorder.getWAVBlob());
  application(stateIndex);
};

const downloadAudio = () => {
  const downloadLink = document.createElement("a");
  downloadLink.href = audioURL;
  downloadLink.setAttribute("download", "audio");
  downloadLink.click();
};

const addButton = (id, funString, text) => {
  const btn = document.createElement("button");
  btn.id = id;
  btn.setAttribute("onclick", funString);
  btn.textContent = text;
  controllerWrapper.append(btn);
};

const addMessage = (text) => {
  const msg = document.createElement("p");
  msg.textContent = text;
  display.append(msg);
};

const addAudio = () => {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = audioURL;
  display.append(audio);
};

const application = (index) => {
  switch (State[index]) {
    case "Initial":
      clearDisplay();
      clearControls();
      break;

    case "Record":
      clearDisplay();
      clearControls();
      addMessage("Recording...");
      addButton("stop", "stopRecording()", "Stop Recording");
      break;

    case "Download":
      clearControls();
      clearDisplay();
      addAudio();
      break;

    default:
      clearControls();
      clearDisplay();
      addMessage("Your browser does not support mediaDevices");
      break;
  }
};

application(stateIndex);
