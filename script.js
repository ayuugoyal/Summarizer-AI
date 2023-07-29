import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import axios from "axios";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}" 
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

//bot's chat intro
const introId = generateUniqueId();
chatContainer.innerHTML += chatStripe(true, " ", introId);

chatContainer.scrollTop = chatContainer.scrollHeight;

const introDiv = document.getElementById(introId);
typeText(
  introDiv,
  "Hi there!! Give me a text or paragraph so that i can give you a summurized version of it..."
);
form.reset();

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chat stripes
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot's chat stripes
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  const prompt = data.get("prompt");
  const options = {
    method: "POST",
    url: "https://summarize-texts.p.rapidapi.com/pipeline",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "fe4a47b54bmshecfbf43a26e769fp131f6ejsn1fe9164c1194",
      "X-RapidAPI-Host": "summarize-texts.p.rapidapi.com",
    },
    data: {
      input: prompt,
    },
  };

  try {
    const response = await axios.request(options);
    const data = response.data.output[0].text;
    console.log({ data });
    typeText(messageDiv, data);
    console.log(response.data);
  } catch (error) {
    const text =
      "Error occured!!! Something went wrong please check your network or reload!!";
    typeText(messageDiv, text);
    console.error(error);
  }

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
