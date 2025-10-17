document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");

  let conversationHistory = [];

  // Function to append a message to the chat box
  const appendMessage = (role, content) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${role}-message`);
    messageElement.textContent = content;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  // Function to add a message to the conversation history
  const addMessageToHistory = (role, text) => {
    conversationHistory.push({ role, text });
  };

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();

    if (!message) {
      return;
    }

    // Add user message to chat box and history
    appendMessage("user", message);
    addMessageToHistory("user", message);
    userInput.value = "";

    // Show "Thinking..." message
    const thinkingMessage = appendMessage("bot", "Thinking...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server.");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Replace "Thinking..." with the actual response
        thinkingMessage.textContent = result.data;
        addMessageToHistory("bot", result.data);
      } else {
        throw new Error(result.message || "Sorry, no response received.");
      }
    } catch (error) {
      // Replace "Thinking..." with an error message
      thinkingMessage.textContent = error.message;
    }
  };

  chatForm.addEventListener("submit", handleFormSubmit);
});