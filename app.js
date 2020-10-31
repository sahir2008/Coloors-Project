// Global Selections and Variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type='range']");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const lockBtns = document.querySelectorAll(".lock");
const adjustBtns = document.querySelectorAll(".adjust");
const closeAdjust = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
// iColor => initial colors
let iColors;
// This is for local storage
let savedPalettes = [];

//  Event Listners
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUi(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustBtns.forEach((adjustBtn, i) => {
  adjustBtn.addEventListener("click", () => {
    openAdjustmentPanel(i);
  });
});

closeAdjust.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    closeAdjustmentPanel(i);
  });
});

lockBtns.forEach((btn, i) => {
  btn.addEventListener("click", (e) => {
    lockLayer(e, i);
  });
});

// Functions

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  iColors = [];

  colorDivs.forEach((div, i) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      iColors.push(hexText.innerText);
      return;
    } else {
      iColors.push(randomColor.hex());
    }

    // Add the color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for Contrast
    checkTextContrast(randomColor, hexText);

    // Initial Colorize Silders inputs
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  //   Reset Inputs

  resetInputs();

  // Check For Buttons Contrast
  adjustBtns.forEach((btn, i) => {
    checkTextContrast(iColors[i], btn);
    checkTextContrast(iColors[i], lockBtns[i]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //   Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  const sliders = e.target.parentElement.querySelectorAll(
    "input[type='range']"
  );
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = iColors[index];
  let color = chroma(bgColor)
    .set("hsl.h", hue.value)
    .set("hsl.l", brightness.value)
    .set("hsl.s", saturation.value);

  colorDivs[index].style.backgroundColor = color;

  // colorize sliders-inputs
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUi(index) {
  const activeDivs = colorDivs[index];
  const color = chroma(activeDivs.style.backgroundColor);
  const textHex = activeDivs.querySelector("h2");
  const icons = activeDivs.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  //   Check Contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = iColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = iColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = iColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const element = document.createElement("textarea");
  element.value = hex.innerText;
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
  //   Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(i) {
  sliderContainers[i].classList.add("active");
}
function closeAdjustmentPanel(i) {
  sliderContainers[i].classList.remove("active");
}

function lockLayer(e, i) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[i];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// Implement Save to  palette and LOCAL STORAGE Stuff

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// Event Listners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}

function savePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // Generate Object
  let paletteNr;

  const palettesObjects = JSON.parse(localStorage.getItem("palettes"));
  if (palettesObjects) {
    paletteNr = palettesObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  // Save to Local Storage
  saveToLocal(paletteObj);
  saveInput.value = "";
  // Generate the palette for Library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);

  // Attach Event to the select palette button
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    iColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, i) => {
      iColors.push(color);
      colorDivs[i].style.background = color;
      const text = colorDivs[i].children[0];
      updateTextUi(i);
    });
    resetInputs();
  });
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const palettesObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...palettesObjects];

    palettesObjects.forEach((paletteObj) => {
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);

      // Attach Event to the select palette button
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        iColors = [];
        palettesObjects[paletteIndex].colors.forEach((color, i) => {
          iColors.push(color);
          colorDivs[i].style.background = color;
          const text = colorDivs[i].children[0];
          updateTextUi(i);
        });
        resetInputs();
      });
    });
  }
}

getLocal();
randomColors();

// ******************************************* Made By Dev Sahir *************************************************

// For Contact: https://www.linkedin.com/in/sahir-mohsen-602706128/
