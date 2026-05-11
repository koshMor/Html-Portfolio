const TOPICS = [
  {
    id: 'one-step',
    title: 'One-Step Equations',
    tagline: 'Build confidence solving x + k = b or x - k = b',
    overview:
      'Undo the operation that is attached to x. Whatever you do to one side of the equation, you must do to the other side to keep the balance.',
    steps: [
      'Identify the operation that is happening to x (addition or subtraction).',
      'Apply the inverse operation to both sides of the equation.',
      'Check your solution by substituting it back into the original equation.'
    ],
    generateProblem() {
      const op = Math.random() < 0.5 ? '+' : '-';
      const x = randomInt(2, 20);
      const k = randomInt(1, 12);
      const b = op === '+' ? x + k : x - k;
      const prompt = `Solve for x: x ${op} ${k} = ${b}`;
      const explanation =
        op === '+'
          ? `x + ${k} = ${b}. Subtract ${k} from both sides to undo the addition. x = ${b - k}.`
          : `x - ${k} = ${b}. Add ${k} to both sides to undo the subtraction. x = ${b + k}.`;
      return {
        prompt,
        answer: x,
        hints: [
          'Start by rewriting the equation so x is on one side by itself.',
          `The inverse of ${op === '+' ? 'addition is subtraction' : 'subtraction is addition'}.`,
          'Always check by plugging your answer into the original equation.'
        ],
        explanation,
        steps: [
          `Look at the operation with x: it is ${op === '+' ? 'adding' : 'subtracting'} ${k}.`,
          `Do the opposite on both sides: ${
            op === '+' ? `subtract ${k}` : `add ${k}`
          } to both sides.`,
          `Now x = ${x}. Substitute back to confirm: ${
            op === '+' ? `${x} + ${k} = ${b}` : `${x} - ${k} = ${b}`
          }.`
        ]
      };
    }
  },
  {
    id: 'two-step',
    title: 'Two-Step Equations',
    tagline: 'Solve ax + b = c by undoing addition/subtraction first, then division',
    overview:
      'Two-step equations require you to peel away layers. Undo addition or subtraction first, then undo multiplication or division.',
    steps: [
      'Move the constant term to the other side using the inverse operation.',
      'Undo multiplication or division to isolate x.',
      'Check your answer in the original equation.'
    ],
    generateProblem() {
      const a = randomInt(2, 9);
      const x = randomInt(1, 12);
      const b = randomInt(1, 10);
      const c = a * x + b;
      const prompt = `Solve for x: ${a}x + ${b} = ${c}`;
      return {
        prompt,
        answer: x,
        hints: [
          'Start by removing the number that is added or subtracted to the x term.',
          'After you move the constant, divide both sides by the coefficient of x.',
          'Double-check by plugging the value of x back into the equation.'
        ],
        explanation: `Subtract ${b} from both sides to get ${a}x = ${c - b}. Then divide both sides by ${a}: x = ${(c - b) / a}.`,
        steps: [
          `Subtract ${b} from both sides: ${a}x = ${c - b}.`,
          `Divide both sides by ${a}: x = ${(c - b) / a}.`,
          `Check: ${a}(${x}) + ${b} = ${a * x + b}.`
        ]
      };
    }
  },
  {
    id: 'slope',
    title: 'Slope from Two Points',
    tagline: 'Use rise over run to find the rate of change',
    overview:
      'Slope measures how steep a line is. It is the ratio of vertical change to horizontal change between two points.',
    steps: [
      'Label the coordinates: (x₁, y₁) and (x₂, y₂).',
      'Compute the change in y: y₂ - y₁ (the rise).',
      'Compute the change in x: x₂ - x₁ (the run).',
      'Slope m = (y₂ - y₁) / (x₂ - x₁). Simplify your fraction if possible.'
    ],
    generateProblem() {
      const x1 = randomInt(-6, 5);
      const y1 = randomInt(-6, 6);
      let x2 = x1;
      while (x2 === x1) x2 = randomInt(-6, 6);
      const y2 = randomInt(-6, 6);
      const rise = y2 - y1;
      const run = x2 - x1;
      const prompt = `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`;
      const simplified = simplifyFraction(rise, run);
      const decimalValue = rise / run;
      return {
        prompt,
        answer: { fraction: simplified, value: decimalValue },
        hints: [
          'Remember “rise over run”: change in y divided by change in x.',
          'Subtract carefully and keep track of negative signs.',
          'Write your answer as a simplified fraction or a decimal.'
        ],
        explanation: `Slope m = (y₂ - y₁) / (x₂ - x₁) = (${y2} - ${y1}) / (${x2} - ${x1}) = ${rise} / ${run} = ${simplified}.`,
        steps: [
          `Label the points: (x₁, y₁) = (${x1}, ${y1}), (x₂, y₂) = (${x2}, ${y2}).`,
          `Find the rise: y₂ - y₁ = ${y2} - ${y1} = ${rise}.`,
          `Find the run: x₂ - x₁ = ${x2} - ${x1} = ${run}.`,
          `Slope m = rise / run = ${rise} / ${run} = ${simplified}.`
        ]
      };
    }
  }
];

const tips = [
  'Say the steps out loud. Hearing them helps lock the process into memory.',
  'Sketch quick number lines or grids to visualize moves you make to x.',
  'Check every answer by substituting it back into the original equation.',
  'Take short breaks. Five minutes of rest keeps your brain fresh.',
  'Explain the solution to someone else (or to yourself!). Teaching reinforces learning.'
];

const PROGRESS_KEY = 'algebra-tutor-progress-v1';
let audioEnabled = true;
let currentTopic = TOPICS[0];
let currentProblem = null;

const els = {
  topicList: document.querySelector('.topic-list'),
  lessonTitle: document.querySelector('#lesson-title'),
  lessonBadge: document.querySelector('#lesson-badge'),
  lessonOverview: document.querySelector('#lesson-overview'),
  lessonSteps: document.querySelector('#lesson-steps'),
  hintList: document.querySelector('#hint-list'),
  problemText: document.querySelector('#problem-text'),
  feedback: document.querySelector('#feedback'),
  answerInput: document.querySelector('#answer'),
  checkButton: document.querySelector('#check-answer'),
  newProblemBtn: document.querySelector('#new-problem'),
  solutionSteps: document.querySelector('#solution-steps'),
  speakButton: document.querySelector('#speak-lesson'),
  toggleSound: document.querySelector('#toggle-sound'),
  totalAttempts: document.querySelector('#total-attempts'),
  correctAttempts: document.querySelector('#correct-attempts'),
  streak: document.querySelector('#current-streak'),
  resetProgress: document.querySelector('#reset-progress'),
  tipList: document.querySelector('#tip-list'),
  studyPlan: document.querySelector('#study-plan'),
  nextStep: document.querySelector('#next-step')
};

function init() {
  renderTopics();
  renderTips();
  renderStudyPlan();
  loadProgress();
  selectTopic(currentTopic.id);
  els.checkButton.addEventListener('click', checkAnswer);
  els.newProblemBtn.addEventListener('click', generateProblem);
  els.answerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkAnswer();
    }
  });
  els.speakButton.addEventListener('click', () => speakLesson(currentTopic));
  els.toggleSound.addEventListener('click', toggleSound);
  els.resetProgress.addEventListener('click', resetProgress);
}

document.addEventListener('DOMContentLoaded', init);

function renderTopics() {
  els.topicList.innerHTML = '';
  TOPICS.forEach((topic) => {
    const button = document.createElement('button');
    button.className = 'topic-button';
    button.dataset.topicId = topic.id;
    button.innerHTML = `<strong>${topic.title}</strong><span>${topic.tagline}</span>`;
    button.addEventListener('click', () => selectTopic(topic.id));
    els.topicList.appendChild(button);
  });
}

function renderTips() {
  els.tipList.innerHTML = '';
  tips.forEach((tip) => {
    const li = document.createElement('li');
    li.textContent = tip;
    els.tipList.appendChild(li);
  });
}

function renderStudyPlan() {
  const items = [
    'Warm-up (3 min): mentally review yesterday\'s topic or explain it aloud.',
    'Direct instruction (5 min): read the overview and steps for today\'s topic.',
    'Guided practice (7 min): solve three problems and talk through each step.',
    'Reflection (3 min): write one thing you learned and one question you still have.',
    'Stretch goal (2 min): attempt a bonus problem or teach the idea to someone else.'
  ];
  els.studyPlan.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    els.studyPlan.appendChild(li);
  });
}

function selectTopic(id) {
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) return;
  currentTopic = topic;
  [...els.topicList.querySelectorAll('.topic-button')].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.topicId === id);
  });
  els.lessonTitle.textContent = topic.title;
  els.lessonBadge.textContent = topic.tagline;
  els.lessonOverview.textContent = topic.overview;
  els.lessonSteps.innerHTML = '';
  topic.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    els.lessonSteps.appendChild(li);
  });
  speakLesson(topic);
  generateProblem();
}

function generateProblem() {
  currentProblem = currentTopic.generateProblem();
  els.problemText.textContent = currentProblem.prompt;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  els.answerInput.value = '';
  els.solutionSteps.innerHTML = '';
  els.hintList.innerHTML = '';
  currentProblem.hints.forEach((hint) => {
    const li = document.createElement('li');
    li.textContent = hint;
    els.hintList.appendChild(li);
  });
  if (audioEnabled) {
    speak(`New problem. ${currentProblem.prompt}`);
  }
  els.answerInput.focus();
}

function checkAnswer() {
  if (!currentProblem) return;
  const userAnswerRaw = els.answerInput.value.trim();
  if (!userAnswerRaw) {
    setFeedback('Please enter an answer before checking.', 'error');
    return;
  }

  const isCorrect = compareAnswers(userAnswerRaw, currentProblem.answer);
  updateProgress(isCorrect);

  if (isCorrect) {
    setFeedback('Awesome! You solved it correctly. 🎉', 'success');
    renderSolution();
    if (audioEnabled) {
      speak('Great job! That answer is correct.');
      playChime(880, 0.18);
    }
  } else {
    setFeedback('Not yet. Read the steps and try again!', 'error');
    renderSolution();
    if (audioEnabled) {
      speak('Not quite. Let\'s review the steps together.');
      playChime(330, 0.18);
    }
  }
}

function compareAnswers(userInput, expected) {
  if (typeof expected === 'number') {
    const num = parseFloat(userInput);
    return isFinite(num) && Math.abs(num - expected) < 1e-6;
  }
  if (typeof expected === 'string') {
    const normalized = normalizeFraction(userInput);
    return normalized === expected;
  }
  if (expected && typeof expected === 'object') {
    const normalized = normalizeFraction(userInput);
    if (normalized === expected.fraction) return true;
    const num = parseFloat(userInput);
    return isFinite(num) && Math.abs(num - expected.value) < 1e-6;
  }
  return false;
}

function renderSolution() {
  if (!currentProblem) return;
  els.solutionSteps.innerHTML = '';
  currentProblem.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    els.solutionSteps.appendChild(li);
  });
}

function setFeedback(message, type) {
  els.feedback.textContent = message;
  els.feedback.className = `feedback ${type}`;
}

function speakLesson(topic) {
  if (!audioEnabled) return;
  const summary = `${topic.title}. ${topic.overview} Key steps: ${topic.steps.join(', ')}.`;
  speak(summary);
}

function speak(text) {
  if (!audioEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function toggleSound() {
  audioEnabled = !audioEnabled;
  els.toggleSound.textContent = audioEnabled ? '🔊 Sound on' : '🔇 Sound off';
  if (!audioEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function playChime(frequency, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gainNode).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.05);
  } catch (error) {
    console.warn('Audio context not available', error);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simplifyFraction(numerator, denominator) {
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const d = gcd(numerator, denominator);
  const simplifiedNum = numerator / d;
  const simplifiedDen = denominator / d;
  if (simplifiedDen < 0) {
    return `${-simplifiedNum}/${-simplifiedDen}`;
  }
  if (simplifiedDen === 1) return `${simplifiedNum}`;
  return `${simplifiedNum}/${simplifiedDen}`;
}

function normalizeFraction(input) {
  if (!input) return '';
  const cleaned = input.replace(/\s+/g, '');
  if (cleaned.includes('/')) {
    const [numStr, denStr] = cleaned.split('/');
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (!isFinite(num) || !isFinite(den) || den === 0) return cleaned;
    return simplifyFraction(num, den);
  }
  const num = parseFloat(cleaned);
  if (isFinite(num)) {
    return simplifyFraction(num, 1);
  }
  return cleaned;
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
  if (saved) {
    progress.total = saved.total || 0;
    progress.correct = saved.correct || 0;
    progress.streak = saved.streak || 0;
  }
  updateProgressTiles();
  updateNextStep();
}

function resetProgress() {
  progress.total = 0;
  progress.correct = 0;
  progress.streak = 0;
  saveProgress();
  updateProgressTiles();
  setFeedback('Progress reset. Fresh start—let\'s go!', 'success');
}

const progress = {
  total: 0,
  correct: 0,
  streak: 0
};

function updateProgress(isCorrect) {
  progress.total += 1;
  if (isCorrect) {
    progress.correct += 1;
    progress.streak += 1;
  } else {
    progress.streak = 0;
  }
  saveProgress();
  updateProgressTiles();
  updateNextStep();
}

function saveProgress() {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ total: progress.total, correct: progress.correct, streak: progress.streak })
  );
}

function updateProgressTiles() {
  els.totalAttempts.textContent = progress.total;
  els.correctAttempts.textContent = progress.correct;
  els.streak.textContent = progress.streak;
}

function updateNextStep() {
  if (progress.total === 0) {
    els.nextStep.textContent = 'Start by solving your first problem. Click “New problem” to begin!';
    return;
  }
  if (progress.correct >= 8) {
    els.nextStep.textContent = 'Amazing streak! Try teaching these steps to a friend or move on to harder equations.';
  } else if (progress.correct >= 4) {
    els.nextStep.textContent = 'You are on a roll. Challenge yourself with two-step equations next.';
  } else {
    els.nextStep.textContent = 'Keep practicing. Aim for three correct answers in a row to build confidence.';
  }
}
