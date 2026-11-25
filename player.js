const player = document.querySelector(".player");
const canvas = player.querySelector("canvas");
const cover = player.querySelector(".player-cover");
const startButton = player.querySelector(".start-game");
const fullscreen = player.querySelector(".fullscreen");
const status = player.querySelector(".player-status");
const progress = player.querySelector("progress");
const warning = player.querySelector(".player-warning");
const build = "Build/" + encodeURIComponent(player.dataset.build);

function showBanner(message, type) {
  const notice = document.createElement("div");
  notice.textContent = message;
  warning.append(notice);
  warning.hidden = false;
  if (type !== "error") {
    setTimeout(() => {
      notice.remove();
      warning.hidden = !warning.childElementCount;
    }, 5000);
  }
}

function loadUnityScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = build + ".loader.js";
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error("Unity loader could not be downloaded"));
    };
    document.body.append(script);
  });
}

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  fullscreen.disabled = true;
  warning.replaceChildren();
  warning.hidden = true;
  status.textContent = "Loading game...";
  progress.value = 0;
  progress.hidden = false;
  canvas.hidden = false;

  try {
    if (typeof createUnityInstance !== "function") await loadUnityScript();
    const unity = await createUnityInstance(canvas, {
      dataUrl: build + ".data",
      frameworkUrl: build + ".framework.js",
      codeUrl: build + ".wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "No more Smiles inc",
      productName: player.dataset.product,
      productVersion: player.dataset.version,
      showBanner
    }, amount => {
      progress.value = amount;
    });
    const shouldFocus = document.activeElement === startButton || document.activeElement === document.body;
    cover.hidden = true;
    fullscreen.disabled = false;
    fullscreen.onclick = () => unity.SetFullscreen(1);
    if (shouldFocus) canvas.focus();
  } catch (error) {
    console.error(error);
    status.textContent = "The game could not load. Try again or refresh the page.";
    canvas.hidden = true;
    progress.hidden = true;
    startButton.disabled = false;
  }
});
