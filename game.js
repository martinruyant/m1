(() => {
  const setupSection = document.querySelector('#setup');
  const gameSection = document.querySelector('#game');
  const resultsSection = document.querySelector('#results');

  const profileForm = document.querySelector('#profile-form');
  const setupError = document.querySelector('#setup-error');
  const nameInput = document.querySelector('#player-name');
  const vibeInput = document.querySelector('#player-vibe');
  const strengthInput = document.querySelector('#player-strength');

  const missionText = document.querySelector('#mission-text');
  const timeLeftNode = document.querySelector('#time-left');
  const scoreNode = document.querySelector('#score');
  const comboNode = document.querySelector('#combo');
  const feedbackNode = document.querySelector('#feedback');

  const arena = document.querySelector('#arena');
  const target = document.querySelector('#target');

  const resultTitle = document.querySelector('#result-title');
  const resultMessage = document.querySelector('#result-message');
  const finalScoreNode = document.querySelector('#final-score');
  const bestComboNode = document.querySelector('#best-combo');
  const avgReactionNode = document.querySelector('#avg-reaction');
  const playAgainBtn = document.querySelector('#play-again');

  const GAME_DURATION = 60;
  const TARGET_SIZE = 64;

  const state = {
    profile: null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: GAME_DURATION,
    timerId: null,
    gameRunning: false,
    targetSpawnedAt: 0,
    reactionTimes: [],
    successfulHits: 0,
    missionIndex: 0,
    missions: []
  };

  const vibes = {
    focused: 'You are analyzing patterns like a grandmaster.',
    creative: 'You bend the rules with creative precision.',
    fearless: 'You charge in with fearless confidence.',
    chill: 'You stay calm while everyone else panics.'
  };

  function sanitizeText(text) {
    return String(text || '').replace(/[<>]/g, '').trim();
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function setActiveSection(section) {
    [setupSection, gameSection, resultsSection].forEach((node) => node.classList.remove('active'));
    section.classList.add('active');
  }

  function resetGameState() {
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.timeLeft = GAME_DURATION;
    state.gameRunning = true;
    state.targetSpawnedAt = performance.now();
    state.reactionTimes = [];
    state.successfulHits = 0;
    state.missionIndex = 0;
    scoreNode.textContent = '0';
    comboNode.textContent = '0';
    timeLeftNode.textContent = String(GAME_DURATION);
    feedbackNode.textContent = `Ready, ${state.profile.name}! Hit the target fast.`;
    target.classList.remove('gold');
    target.disabled = false;
  }

  function createMissions(profile) {
    const strength = profile.strength || 'making impossible things happen';
    return [
      `Mission 1: ${profile.name}, warm up your ${strength}.`,
      `Mission 2: Keep the combo alive — ${vibes[profile.vibe]}`,
      'Mission 3: Golden core grants bonus points. Watch for it.',
      `Mission 4: Stay sharp. Legends never hesitate.`,
      `Mission 5: You are now in the zone. Keep climbing.`
    ];
  }

  function moveTarget() {
    const arenaRect = arena.getBoundingClientRect();
    const maxX = Math.max(0, Math.floor(arenaRect.width - TARGET_SIZE));
    const maxY = Math.max(0, Math.floor(arenaRect.height - TARGET_SIZE));

    target.style.left = `${randomInt(0, maxX)}px`;
    target.style.top = `${randomInt(0, maxY)}px`;

    state.targetSpawnedAt = performance.now();
    const isGolden = state.successfulHits > 0 && state.successfulHits % 7 === 0;
    target.classList.toggle('gold', isGolden);
  }

  function updateMission() {
    const next = state.missions[state.missionIndex % state.missions.length];
    missionText.textContent = next;
    state.missionIndex += 1;
  }

  function startGame() {
    resetGameState();
    updateMission();
    moveTarget();

    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      timeLeftNode.textContent = String(Math.max(0, state.timeLeft));

      if (state.timeLeft > 0 && state.timeLeft % 12 === 0) {
        updateMission();
      }

      if (state.timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function rankForScore(score) {
    if (score >= 1800) return 'Mythic Reflex Titan';
    if (score >= 1300) return 'Elite Tempo Master';
    if (score >= 900) return 'Rising Legend';
    return 'Bold Contender';
  }

  function endGame() {
    if (!state.gameRunning) return;
    state.gameRunning = false;
    clearInterval(state.timerId);
    target.disabled = true;

    const avg = state.reactionTimes.length
      ? Math.round(state.reactionTimes.reduce((sum, v) => sum + v, 0) / state.reactionTimes.length)
      : 0;

    const rank = rankForScore(state.score);

    resultTitle.textContent = `${state.profile.name}, you are a ${rank}`;
    resultMessage.textContent = `${vibes[state.profile.vibe]} Your ${state.profile.strength || 'consistency'} was unstoppable.`;
    finalScoreNode.textContent = String(state.score);
    bestComboNode.textContent = String(state.bestCombo);
    avgReactionNode.textContent = String(avg);

    setActiveSection(resultsSection);
  }

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    setupError.textContent = '';

    const name = sanitizeText(nameInput.value);
    const strength = sanitizeText(strengthInput.value);

    if (!name) {
      setupError.textContent = 'Please enter your name to begin.';
      nameInput.focus();
      return;
    }

    state.profile = {
      name,
      vibe: vibeInput.value,
      strength
    };
    state.missions = createMissions(state.profile);

    setActiveSection(gameSection);
    startGame();
  });

  target.addEventListener('click', () => {
    if (!state.gameRunning) return;

    const reaction = Math.max(30, Math.round(performance.now() - state.targetSpawnedAt));
    state.reactionTimes.push(reaction);

    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.successfulHits += 1;

    const base = target.classList.contains('gold') ? 200 : 100;
    const speedBonus = Math.max(0, 400 - reaction);
    const comboBonus = state.combo * 8;

    const points = base + speedBonus + comboBonus;
    state.score += points;

    scoreNode.textContent = String(state.score);
    comboNode.textContent = String(state.combo);

    feedbackNode.textContent = `${state.profile.name}: +${points} (${reaction} ms reaction)`;
    moveTarget();
  });

  arena.addEventListener('click', (event) => {
    if (!state.gameRunning || event.target === target) return;

    state.combo = 0;
    comboNode.textContent = '0';
    feedbackNode.textContent = `${state.profile.name}, refocus and strike the core.`;
  });

  playAgainBtn.addEventListener('click', () => {
    setActiveSection(setupSection);
    profileForm.reset();
    nameInput.focus();
  });

  window.addEventListener('resize', () => {
    if (state.gameRunning) {
      moveTarget();
    }
  });
})();
