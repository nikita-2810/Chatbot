const API_KEY = "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"; // 🔑 Replace with your Groq API Key
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// 📨 Add Chat Message (User or Bot)
function addMessage(message, isUser, isTyping = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", isUser ? "user-message" : "bot-message");

  const profileImage = document.createElement("img");
  profileImage.classList.add("profile-image");
  profileImage.src = isUser ? "user.png" : "chat.jpg";
  profileImage.alt = isUser ? "User" : "Bot";

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  if (isTyping) {
    messageContent.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
  } else {
    messageContent.innerHTML = formatMessage(message); // ✅ Structured HTML
  }

  messageElement.appendChild(profileImage);
  messageElement.appendChild(messageContent);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageElement;
}

// 🤖 Call Groq API
async function generateResponse(prompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful chatbot. Format answers with clear structure, lists, and highlights where needed." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error("Failed to generate response");

  const data = await response.json();
  return data.choices[0].message.content;
}

// 👤 Handle User Input
async function handleUserInput() {
  const userMessage = userInput.value.trim();

  if (userMessage) {
    addMessage(userMessage, true);
    userInput.value = "";
    sendButton.disabled = true;
    userInput.disabled = true;

    // Show typing indicator
    const typingMessage = addMessage("", false, true);

    try {
      const botMessage = await generateResponse(userMessage);
      typingMessage.querySelector(".message-content").innerHTML = formatMessage(botMessage);

    } catch (error) {
      console.error("Error:", error);
      typingMessage.querySelector(".message-content").textContent =
        "⚠️ Sorry, I encountered an error. Please try again.";
    } finally {
      sendButton.disabled = false;
      userInput.disabled = false;
      userInput.focus();
    }
  }
}

// 🎯 Event Listeners
sendButton.addEventListener("click", handleUserInput);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserInput();
  }
});

// 📑 Format Bot Message into Structured HTML
function formatMessage(text) {
  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Numbered list (1. 2. 3.)
  if (/\d+\.\s+/.test(text)) {
    text = text.replace(/(?:\n|^)\d+\.\s+(.*)/g, "<li>$1</li>");
    text = "<ol>" + text + "</ol>";
  }

  // Bullet list (- or *)
  else if (/[-*]\s+/.test(text)) {
    text = text.replace(/(?:\n|^)[*-]\s+(.*)/g, "<li>$1</li>");
    text = "<ul>" + text + "</ul>";
  }

  // Line breaks
  text = text.replace(/\n/g, "<br>");

  return text;
}
