// Grab all the elements we need
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const sourceLang = document.getElementById("sourceLang");
const targetLang = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");
const speakBtn = document.getElementById("speakBtn");
const statusMsg = document.getElementById("statusMsg");
const charCount = document.getElementById("charCount");

// Show live character count
inputText.addEventListener("input", () => {
  charCount.textContent = `${inputText.value.length} characters`;
});

// Main translate function — calls the free MyMemory Translation API
async function translateText() {
  const text = inputText.value.trim();
  const from = sourceLang.value;
  const to = targetLang.value;

  // Basic validation
  if (!text) {
    statusMsg.textContent = "Please enter some text to translate!!!";
    return;
  }

  if (from === to) {
    statusMsg.textContent = " Source and target languages are the same!!!";
    outputText.value = text;
    return;
  }

  // Show loading state
  statusMsg.textContent = "";
  translateBtn.disabled = true;
  translateBtn.textContent = "Translating... WAIT!!!!!!";
  outputText.value = "";

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${from}|${to}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData) {
      outputText.value = data.responseData.translatedText;
    } else {
      throw new Error("Translation failed");
    }
  } catch (error) {
    console.error(error);
    statusMsg.textContent = " Something went wrong!!!!! Please try again.";
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate ";
  }
}

translateBtn.addEventListener("click", translateText);

// Allow Enter (without Shift) to trigger translation too
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    translateText();
  }
});

// Swap source/target languages and text
swapBtn.addEventListener("click", () => {
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;

  const tempText = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tempText;

  charCount.textContent = `${inputText.value.length} characters`;
});

// Copy translated text to clipboard
copyBtn.addEventListener("click", async () => {
  if (!outputText.value) {
    statusMsg.textContent = "Nothing to copy yet!!!!";
    return;
  }
  try {
    await navigator.clipboard.writeText(outputText.value);
    copyBtn.textContent = "Copied!!!!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch (err) {
    statusMsg.textContent = " Couldn't copy text.";
  }
});

// Text-to-speech for the translated text
speakBtn.addEventListener("click", () => {
  if (!outputText.value) {
    statusMsg.textContent = "Nothing to read yet!!!!";
    return;
  }

  if (!("speechSynthesis" in window)) {
    statusMsg.textContent = "Text-to-speech not supported in this browser!!!";
    return;
  }

  const utterance = new SpeechSynthesisUtterance(outputText.value);
  utterance.lang = targetLang.value;
  window.speechSynthesis.cancel(); // stop any ongoing speech first
  window.speechSynthesis.speak(utterance);
});