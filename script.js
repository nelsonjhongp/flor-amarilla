const scene = document.querySelector('#scene');
const bouquetButton = document.querySelector('#bouquetButton');
const rainButton = document.querySelector('#rainButton');
const musicButton = document.querySelector('#musicButton');
const backgroundMusic = document.querySelector('#backgroundMusic');
const playIcon = document.querySelector('#playIcon');
const pauseIcon = document.querySelector('#pauseIcon');
const letter = document.querySelector('#letter');
const fallLayer = document.querySelector('#fallLayer');
const sparkleLayer = document.querySelector('#sparkleLayer');
const status = document.querySelector('#status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let opened = false;
let rainTimer;
const random = (min, max) => Math.random() * (max - min) + min;
const musicMode = new URLSearchParams(window.location.search).get('m');

backgroundMusic.src = musicMode === 'at' ? 'aphex-twin.ogg' : 'default.ogg';

function removeAfterAnimation(element) {
  element.addEventListener('animationend', () => element.remove(), { once: true });
}

function makePetal({ fromBouquet = false } = {}) {
  const petal = document.createElement('span');
  petal.className = 'falling-petal';
  petal.style.left = fromBouquet ? `${random(40, 60)}%` : `${random(3, 97)}%`;
  petal.style.top = fromBouquet ? `${random(30, 47)}%` : '-24px';
  petal.style.setProperty('--size', `${random(6, 12)}px`);
  petal.style.setProperty('--duration', `${random(5.5, 9.5)}s`);
  petal.style.setProperty('--delay', `${random(0, fromBouquet ? .35 : 2.7)}s`);
  petal.style.setProperty('--drift', `${random(-90, 90)}px`);
  petal.style.setProperty('--start', `${random(-90, 90)}deg`);
  petal.style.setProperty('--end', `${random(280, 760)}deg`);
  fallLayer.appendChild(petal);
  removeAfterAnimation(petal);
}

function burstPetals(x, y, count = 6) {
  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'falling-petal';
    petal.style.left = `${x + random(-10, 10)}px`;
    petal.style.top = `${y + random(-10, 10)}px`;
    petal.style.setProperty('--size', `${random(6, 10)}px`);
    petal.style.setProperty('--duration', `${random(2.5, 4.2)}s`);
    petal.style.setProperty('--delay', `${random(0, .2)}s`);
    petal.style.setProperty('--drift', `${random(-85, 85)}px`);
    petal.style.setProperty('--start', `${random(-90, 90)}deg`);
    petal.style.setProperty('--end', `${random(200, 600)}deg`);
    fallLayer.appendChild(petal);
    removeAfterAnimation(petal);
  }
}

function makeMiniFlower() {
  const flower = document.createElement('span');
  flower.className = 'mini-flower';
  flower.style.left = `${random(5, 95)}%`;
  flower.style.top = '-35px';
  flower.style.setProperty('--size', `${random(20, 31)}px`);
  flower.style.setProperty('--duration', `${random(8, 12)}s`);
  flower.style.setProperty('--delay', `${random(.4, 3)}s`);
  flower.style.setProperty('--drift', `${random(-65, 65)}px`);
  flower.style.setProperty('--end', `${random(220, 520)}deg`);
  flower.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    const rect = flower.getBoundingClientRect();
    flower.remove();
    burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2, 7);
  }, { once: true });
  fallLayer.appendChild(flower);
  removeAfterAnimation(flower);
}

function makeSparkles(count = 9) {
  const rect = bouquetButton.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height * .35;
  for (let index = 0; index < count; index += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${x + random(-50, 50)}px`;
    sparkle.style.top = `${y + random(-45, 45)}px`;
    sparkle.style.setProperty('--size', `${random(2, 4.5)}px`);
    sparkle.style.setProperty('--dx', `${random(-70, 70)}px`);
    sparkle.style.setProperty('--dy', `${random(-65, 55)}px`);
    sparkleLayer.appendChild(sparkle);
    removeAfterAnimation(sparkle);
  }
}

function softRain() {
  if (reducedMotion.matches) return;
  window.clearInterval(rainTimer);
  let released = 0;
  rainTimer = window.setInterval(() => {
    makePetal();
    if (released % 5 === 0) makeMiniFlower();
    released += 1;
    if (released >= 28) window.clearInterval(rainTimer);
  }, 170);
}

function syncMusicButton() {
  const isPlaying = !backgroundMusic.paused;
  musicButton.classList.toggle('is-playing', isPlaying);
  musicButton.setAttribute('aria-pressed', String(isPlaying));
  musicButton.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
  musicButton.title = isPlaying ? 'Pausar música' : 'Reproducir música';
  playIcon.hidden = isPlaying;
  pauseIcon.hidden = !isPlaying;
}

async function startMusic() {
  try {
    await backgroundMusic.play();
    syncMusicButton();
  } catch {
    // Los navegadores móviles suelen exigir una primera interacción del usuario.
  }
}

function animateBouquetMove(startRect) {
  if (reducedMotion.matches || typeof bouquetButton.animate !== 'function') return;
  const bouquetWrap = bouquetButton.querySelector('.bouquet-wrap');
  const endRect = bouquetButton.getBoundingClientRect();
  const parentScale = endRect.width / bouquetButton.offsetWidth || 1;
  const deltaX = (startRect.left + startRect.width / 2 - endRect.left - endRect.width / 2) / parentScale;
  const deltaY = (startRect.top + startRect.height / 2 - endRect.top - endRect.height / 2) / parentScale;
  const scaleX = startRect.width / endRect.width;
  const scaleY = startRect.height / endRect.height;

  bouquetWrap.animate([
    { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})` },
    { transform: 'scale(1.045)' },
  ], {
    duration: 1050,
    easing: 'cubic-bezier(.2,.78,.2,1)',
    fill: 'both',
  });
}

function openGift() {
  if (opened) {
    for (let index = 0; index < 4; index += 1) makePetal({ fromBouquet: true });
    return;
  }
  opened = true;
  const bouquetWrap = bouquetButton.querySelector('.bouquet-wrap');
  bouquetWrap.style.transform = '';
  const startRect = bouquetButton.getBoundingClientRect();
  scene.classList.add('is-open');
  animateBouquetMove(startRect);
  bouquetButton.setAttribute('aria-expanded', 'true');
  bouquetButton.setAttribute('aria-label', 'Ramo de girasoles abierto; tocar para soltar pétalos');
  letter.setAttribute('aria-hidden', 'false');
  musicButton.hidden = false;
  rainButton.hidden = false;
  void startMusic();
  status.textContent = 'El ramo floreció y apareció una pequeña carta.';
  makeSparkles(11);
  for (let index = 0; index < 7; index += 1) makePetal({ fromBouquet: true });
  window.setTimeout(softRain, 450);
  navigator.vibrate?.(18);
}

bouquetButton.addEventListener('click', openGift);
musicButton.addEventListener('click', async () => {
  if (backgroundMusic.paused) {
    await startMusic();
  } else {
    backgroundMusic.pause();
    syncMusicButton();
  }
});
rainButton.addEventListener('click', () => {
  softRain();
  status.textContent = 'Comenzó otra lluvia suave de pétalos y girasoles.';
});

scene.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType === 'touch' || opened) return;
  const x = (event.clientX / window.innerWidth - .5) * 8;
  const y = (event.clientY / window.innerHeight - .5) * 5;
  bouquetButton.querySelector('.bouquet-wrap').style.transform = `translate(${x}px, ${y}px)`;
});
scene.addEventListener('pointerleave', () => {
  if (!opened) bouquetButton.querySelector('.bouquet-wrap').style.transform = '';
});

void startMusic();
