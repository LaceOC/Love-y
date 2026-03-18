const CONFIG = {
  maxClicks: 10,

  spiderAsset: 'assets/spider.webp',

  clickParticlesEnabled: true,
  clickParticlesIntensity: 1,

  transitionVideoEnabled: false,
  transitionVideo: 'assets/transition.mp4',
  transitionVideoFit: 'contain',

  audioEnabled: true,
  audioTrack: 'assets/music.mp3',
  audioVolume: 0.8,
  audioLoop: true,
  audioStartEvent: 'heartScene',

  heartText: 'Feliz aniversario <3 Juh',
  heartItems: 100,
};

const state = {
  clicks: 0,
  audioUnlocked: false,
  audioStarted: false,
  finalTriggered: false,
};

const elements = {
  viewportFrame: document.querySelector('.viewport-frame'),
  giftScene: document.getElementById('giftScene'),
  transitionScene: document.getElementById('transitionScene'),
  heartScene: document.getElementById('heartScene'),
  giftBox: document.getElementById('giftBox'),
  progressFill: document.getElementById('progressFill'),
  progressIndicator: document.getElementById('progressIndicator'),
  spiderIndicator: document.getElementById('spiderIndicator'),
  progressFallback: document.getElementById('progressFallback'),
  clickCount: document.getElementById('clickCount'),
  maxClicksLabel: document.getElementById('maxClicksLabel'),
  particleLayer: document.getElementById('particleLayer'),
  confettiLayer: document.getElementById('confettiLayer'),
  transitionVideo: document.getElementById('transitionVideo'),
  heartCloud: document.getElementById('heartCloud'),
  audioUnlock: document.getElementById('audioUnlock'),
};

let audio;

init();

function init() {
  elements.maxClicksLabel.textContent = CONFIG.maxClicks;
  setupScenes();
  setupIndicator();
  setupGiftInteraction();
  setupAudio();
  buildHeart();
  updateProgress();
}

function setupScenes() {
  setScene(elements.giftScene);
  elements.transitionVideo.style.objectFit = CONFIG.transitionVideoFit;
}

function setScene(activeScene) {
  [elements.giftScene, elements.transitionScene, elements.heartScene].forEach((scene) => {
    const isActive = scene === activeScene;
    scene.classList.toggle('is-active', isActive);
    scene.setAttribute('aria-hidden', String(!isActive));
  });
}

function setupIndicator() {
  const indicator = new Image();
  indicator.src = CONFIG.spiderAsset;
  indicator.onload = () => {
    elements.spiderIndicator.src = CONFIG.spiderAsset;
    elements.spiderIndicator.hidden = false;
    elements.progressFallback.hidden = true;
  };
  indicator.onerror = () => {
    elements.spiderIndicator.hidden = true;
    elements.progressFallback.hidden = false;
  };
}

function setupGiftInteraction() {
  elements.giftBox.addEventListener('click', handleGiftClick, { passive: true });
}

function handleGiftClick() {
  if (state.finalTriggered || state.clicks >= CONFIG.maxClicks) {
    return;
  }

  state.clicks += 1;
  updateProgress();
  scaleGift();

  if (CONFIG.clickParticlesEnabled) {
    emitPartycles(elements.giftBox, CONFIG.clickParticlesIntensity);
  }

  if (state.clicks === CONFIG.maxClicks) {
    triggerFinale();
  }
}

function updateProgress() {
  const progress = state.clicks / CONFIG.maxClicks;
  elements.progressFill.style.width = `${progress * 100}%`;
  elements.progressIndicator.style.left = `${progress * 100}%`;
  elements.clickCount.textContent = state.clicks;
}

function scaleGift() {
  const scale = 1 + state.clicks * 0.055;
  elements.giftBox.style.setProperty('--gift-scale', scale.toFixed(3));
}

function emitPartycles(anchor, intensity = 1) {
  const layerRect = elements.particleLayer.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const originX = anchorRect.left + anchorRect.width / 2 - layerRect.left;
  const originY = anchorRect.top + anchorRect.height / 2 - layerRect.top;
  const total = Math.max(10, Math.round(18 * intensity));
  const palette = ['#ff5c8a', '#ffd166', '#7bdff2', '#ffffff', '#c792ea'];

  for (let i = 0; i < total; i += 1) {
    const particle = document.createElement('span');
    const angle = (Math.PI * 2 * i) / total + Math.random() * 0.5;
    const distance = 30 + Math.random() * 60 * intensity;
    const size = 4 + Math.random() * 7;
    const dx = `${Math.cos(angle) * distance}px`;
    const dy = `${Math.sin(angle) * distance}px`;

    particle.className = 'particle';
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = palette[i % palette.length];
    particle.style.setProperty('--dx', dx);
    particle.style.setProperty('--dy', dy);
    particle.style.animation = `particleBurst ${480 + Math.random() * 380}ms cubic-bezier(.18,.7,.22,1) forwards`;
    elements.particleLayer.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
  }
}

function triggerFinale() {
  state.finalTriggered = true;
  elements.giftBox.classList.add('is-shaking');
  emitPartycles(elements.giftBox, CONFIG.clickParticlesIntensity * 2.2);
  showerConfetti();

  window.setTimeout(() => {
    elements.giftBox.classList.remove('is-shaking');
    startTransition();
  }, 1800);
}

function showerConfetti() {
  const count = 42;
  const colors = ['#ff4d6d', '#ffd166', '#f9f871', '#4cc9f0', '#ffffff'];

  for (let i = 0; i < count; i += 1) {
    const confetti = document.createElement('span');
    confetti.className = 'confetti';
    confetti.style.left = `${15 + Math.random() * 70}%`;
    confetti.style.top = `${20 + Math.random() * 18}%`;
    confetti.style.width = `${6 + Math.random() * 8}px`;
    confetti.style.height = `${10 + Math.random() * 10}px`;
    confetti.style.borderRadius = `${Math.random() > 0.5 ? '2px' : '999px'}`;
    confetti.style.background = colors[i % colors.length];
    confetti.style.setProperty('--dx', `${-80 + Math.random() * 160}px`);
    confetti.style.setProperty('--dy', `${180 + Math.random() * 260}px`);
    confetti.style.setProperty('--rot', `${Math.random() * 540 - 270}deg`);
    confetti.style.animation = `confettiFall ${1100 + Math.random() * 800}ms ease-in forwards`;
    elements.confettiLayer.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove(), { once: true });
  }
}

async function startTransition() {
  setScene(elements.transitionScene);

  if (CONFIG.transitionVideoEnabled) {
    const played = await tryPlayTransitionVideo();
    if (played) {
      return;
    }
  }

  elements.viewportFrame.classList.add('is-fading');
  window.setTimeout(() => {
    elements.viewportFrame.classList.remove('is-fading');
    enterHeartScene();
  }, 1200);
}

async function tryPlayTransitionVideo() {
  const video = elements.transitionVideo;
  video.src = CONFIG.transitionVideo;
  video.style.display = 'block';
  video.muted = true;

  const cleanup = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.style.display = 'none';
  };

  return new Promise((resolve) => {
    const fallback = () => {
      cleanup();
      resolve(false);
    };

    video.onended = () => {
      cleanup();
      enterHeartScene();
      resolve(true);
    };

    video.onerror = fallback;

    video.play().catch(fallback);

    window.setTimeout(() => {
      if (video.readyState < 2) {
        fallback();
      }
    }, 1500);
  });
}

function setupAudio() {
  if (!CONFIG.audioEnabled) {
    return;
  }

  audio = new Audio(CONFIG.audioTrack);
  audio.loop = CONFIG.audioLoop;
  audio.volume = CONFIG.audioVolume;
  audio.preload = 'auto';

  audio.addEventListener('canplaythrough', () => {
    state.audioUnlocked = true;
  });

  audio.addEventListener('error', () => {
    state.audioUnlocked = false;
  });

  elements.audioUnlock.addEventListener('click', async () => {
    const started = await playAudio();
    if (started) {
      elements.audioUnlock.hidden = true;
    }
  });
}

function enterHeartScene() {
  setScene(elements.heartScene);

  if (CONFIG.audioEnabled && CONFIG.audioStartEvent === 'heartScene') {
    playAudio().then((started) => {
      elements.audioUnlock.hidden = started;
      if (!started) {
        elements.audioUnlock.hidden = false;
      }
    });
  }
}

async function playAudio() {
  if (!audio || state.audioStarted) {
    return state.audioStarted;
  }

  try {
    await audio.play();
    state.audioStarted = true;
    return true;
  } catch (error) {
    return false;
  }
}

function buildHeart() {
  const total = CONFIG.heartItems;
  const cloud = elements.heartCloud;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < total; i += 1) {
    const ratio = i / total;
    const angle = ratio * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
    const span = document.createElement('span');
    const text = document.createElement('span');
    span.className = 'heart-item';
    text.className = 'heart-item__text';
    span.style.setProperty('--i', i);
    span.style.setProperty('--tx', `${x * 9}px`);
    span.style.setProperty('--ty', `${y * 9}px`);
    span.style.setProperty('--delay', `${(-i / total) * 5.4}s`);
    text.textContent = CONFIG.heartText;
    span.appendChild(text);
    fragment.appendChild(span);
  }

  cloud.appendChild(fragment);
}
