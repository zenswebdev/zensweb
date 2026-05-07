// --- Preloader ---
const assetsToPreload = [
  "assets/warning-1.webp",       
  "assets/power_active.webp",
  "assets/space2.gif",
  "assets/head_spin_glasses-2.gif" 
];

let loaded = 0;
assetsToPreload.forEach(src => {
  const img = new Image();
  img.src = src;
  img.onload = img.onerror = () => {
    loaded++;
    if (loaded === assetsToPreload.length) {
      // Hide preloader when everything is loaded
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }
  };
});
const powerBtn = document.getElementById("powerButton");
const img = powerBtn.querySelector(".power-symbol");
const screenOff = document.getElementById("screenOff");

powerBtn.addEventListener("click", () => {
  if (powerBtn.classList.contains("active")) {
    // Turn OFF
    powerBtn.classList.remove("active");
    img.src = "assets/power_inactive.webp";
    screenOff.classList.add("active");
  } else {
    // Turn ON
    powerBtn.classList.add("active");
    img.src = "assets/power_active.webp";
    screenOff.classList.remove("active");
  }
});

// keep correct image after mouse release
powerBtn.addEventListener("mouseup", () => {
  img.src = powerBtn.classList.contains("active")
            ? "assets/power_active.webp"
            : "assets/power_inactive.webp";
});

const loginBtn = document.getElementById("signinBtn");
  loginBtn.addEventListener("click", () => {
    window.location.href = "./computer.html";
});

