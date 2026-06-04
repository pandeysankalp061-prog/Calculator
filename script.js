/* ============================================
   Modern Calculator — script.js
   ============================================ */

// ── State ──────────────────────────────────────
let currentValue  = '0';   // number currently shown on display
let previousValue = '';    // number before operator was pressed
let operator      = null;  // active operator: '+' '-' '*' '/'
let freshResult   = false; // true right after "=" so next digit starts fresh
let justPressedOp = false; // true right after an operator key

// ── Operator symbol map ─────────────────────────
const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// ── DOM helpers ────────────────────────────────
const mainEl  = () => document.getElementById('mainNumber');
const histEl  = () => document.getElementById('history');

// ── Render ──────────────────────────────────────
function render() {
  mainEl().textContent = currentValue;
  adjustFontSize(currentValue);
}

// Shrink font for long numbers
function adjustFontSize(value) {
  const el = mainEl();
  el.classList.remove('medium', 'small');
  if (value.length > 10) el.classList.add('small');
  else if (value.length > 7) el.classList.add('medium');
}

// ── Operator highlight ──────────────────────────
function clearOpHighlight() {
  ['+', '-', '*', '/'].forEach(o => {
    const btn = document.getElementById('op-' + o);
    if (btn) btn.classList.remove('active');
  });
}

function highlightOp(o) {
  clearOpHighlight();
  const btn = document.getElementById('op-' + o);
  if (btn) btn.classList.add('active');
}

// ── Format number for display ──────────────────
function format(n) {
  if (typeof n === 'string') return n;          // pass through 'Error'
  // Avoid floating-point noise (0.1+0.2 etc.)
  let s = parseFloat(n.toFixed(10)).toString();
  if (s.length > 14) s = parseFloat(n).toExponential(4);
  return s;
}

// ── Button actions ──────────────────────────────

// Digit pressed (0–9)
function num(digit) {
  if (freshResult)   { currentValue = '0'; freshResult = false; }
  if (justPressedOp) { currentValue = '0'; justPressedOp = false; }
  clearOpHighlight();

  currentValue = currentValue === '0' ? digit : currentValue + digit;

  // Limit length to avoid overflow
  if (currentValue.replace('-', '').replace('.', '').length > 12) {
    currentValue = currentValue.slice(0, -1);
  }
  render();
}

// Decimal point
function dot() {
  if (freshResult)   { currentValue = '0'; freshResult = false; }
  if (justPressedOp) { currentValue = '0'; justPressedOp = false; }
  if (!currentValue.includes('.')) currentValue += '.';
  render();
}

// Operator pressed (+, -, *, /)
function op(o) {
  freshResult = false;

  // Chain: if an operator was already set and a new number entered, compute first
  if (operator && !justPressedOp) compute(false);

  previousValue = currentValue;
  operator      = o;
  justPressedOp = true;

  histEl().textContent = format(previousValue) + ' ' + SYMBOLS[o];
  highlightOp(o);
}

// Core arithmetic
function compute(isFinal) {
  if (!operator || !previousValue) return;

  const a = parseFloat(previousValue);
  const b = parseFloat(currentValue);
  let result;

  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b === 0 ? 'Error' : a / b; break;
  }

  currentValue = result === 'Error' ? 'Error' : format(result);

  if (isFinal) {
    histEl().textContent =
      format(a) + ' ' + SYMBOLS[operator] + ' ' + format(b) + ' =';
    operator      = null;
    freshResult   = true;
    justPressedOp = false;
    clearOpHighlight();
  }

  render();
}

// Equals button
function equals() {
  if (!operator) return;
  compute(true);
}

// AC — clear everything
function clearAll() {
  currentValue  = '0';
  previousValue = '';
  operator      = null;
  freshResult   = false;
  justPressedOp = false;
  histEl().textContent = '\u00a0';
  clearOpHighlight();
  render();
}

// Toggle positive / negative
function toggleSign() {
  if (currentValue !== '0' && currentValue !== 'Error') {
    currentValue = (parseFloat(currentValue) * -1).toString();
    render();
  }
}

// Percentage
function percent() {
  if (currentValue !== 'Error') {
    currentValue = (parseFloat(currentValue) / 100).toString();
    render();
  }
}

// ── Keyboard support ────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') num(e.key);
  else if (e.key === '.')                     dot();
  else if (['+', '-', '*', '/'].includes(e.key)) op(e.key);
  else if (e.key === 'Enter' || e.key === '=')   equals();
  else if (e.key === 'Escape')                   clearAll();
  else if (e.key === 'Backspace') {
    if (currentValue === 'Error') { clearAll(); return; }
    if (freshResult || justPressedOp) return;
    currentValue = currentValue.length > 1
      ? currentValue.slice(0, -1)
      : '0';
    render();
  }
});
