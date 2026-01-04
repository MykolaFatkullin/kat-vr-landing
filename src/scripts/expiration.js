import { clearError, setError } from './form';

const modal = document.querySelector('.card-secure__field--expiration');
const expiration = document.querySelector('.card-secure__input--expiration');

export function configureExpiration() {
  configureCardExpirationEvents();
  configureKeyboard();
}

function getRaw() {
  return expiration.value.replace(/\D/g, '').slice(0, 4);
}

function format(raw) {
  if (raw.length <= 2) {
    return raw;
  }

  return `${raw.slice(0, 2)} / ${raw.slice(2)}`;
}

function setValue(raw) {
  expiration.value = format(raw);
}

export function getError(raw) {
  if (raw.length !== 4) {
    return 'expirationDateRequired';
  }

  const month = parseInt(raw.slice(0, 2), 10);
  const year = parseInt(raw.slice(2), 10);

  if (month < 1 || month > 12) {
    return 'expirationInvalid';
  }

  const fullYear = 2000 + year;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (
    fullYear < currentYear
    || fullYear > currentYear + 20
    || (fullYear === currentYear && month < currentMonth)
  ) {
    return 'expirationInvalid';
  }

  return undefined;
}

function normalizeCursor(pos) {
  if (pos <= 2) {
    return pos;
  }

  if (pos <= 4) {
    return 5;
  }

  return pos;
}

function valueIndexToRaw(index) {
  if (index <= 2) {
    return index;
  }

  return index - 3;
}

function rawIndexToValue(index) {
  if (index <= 2) {
    return index;
  }

  return index + 3;
}

function configureCardExpirationEvents() {
  configureBeforeInput();

  expiration.addEventListener('input', () => {
    clearError(modal);
    setValue(getRaw());
  });

  expiration.addEventListener('blur', () => {
    const error = getError(getRaw());

    if (error) {
      setError(modal, error);
    }
  });

  expiration.addEventListener('focus', () => {
    const pos = normalizeCursor(expiration.selectionStart || 0);

    expiration.setSelectionRange(pos, pos);
  });
}

function configureBeforeInput() {
  expiration.addEventListener('beforeinput', (e) => {
    if (!e.data || !/\d/.test(e.data)) {
      return;
    }

    e.preventDefault();
    clearError(modal);

    const raw = getRaw();

    if (raw.length >= 4) {
      return;
    }

    const valueCursor = normalizeCursor(expiration.selectionStart);
    const rawCursor = valueIndexToRaw(valueCursor);

    const next = raw.slice(0, rawCursor) + e.data + raw.slice(rawCursor);

    setValue(next);

    const nextCursor = rawIndexToValue(rawCursor + 1);

    expiration.setSelectionRange(nextCursor, nextCursor);
  });
}

function configureKeyboard() {
  expiration.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveCursor(-1);
        break;

      case 'ArrowRight':
        e.preventDefault();
        moveCursor(1);
        break;

      case 'Backspace':
        e.preventDefault();
        handleBackspace();
        break;

      case 'Delete':
        e.preventDefault();
        handleDelete();
        break;
    }
  });
}

function moveCursor(delta) {
  let pos = expiration.selectionStart + delta;

  if (delta > 0) {
    pos = skipSeparatorRight(pos);
  } else {
    pos = skipSeparatorLeft(pos);
  }

  pos = Math.max(0, Math.min(expiration.value.length, pos));
  expiration.setSelectionRange(pos, pos);
}

function skipSeparatorRight(pos) {
  if (pos >= 2 && pos <= 4) {
    return 5;
  }

  return pos;
}

function skipSeparatorLeft(pos) {
  if (pos >= 2 && pos <= 4) {
    return 2;
  }

  return pos;
}

function handleBackspace() {
  const raw = getRaw();

  const valueCursor = normalizeCursor(expiration.selectionStart);
  const rawCursor = valueIndexToRaw(valueCursor);

  if (rawCursor === 0) {
    return;
  }

  const next = raw.slice(0, rawCursor - 1) + raw.slice(rawCursor);

  setValue(next);

  const nextCursor = rawIndexToValue(rawCursor - 1);

  expiration.setSelectionRange(nextCursor, nextCursor);
}

function handleDelete() {
  const raw = getRaw();

  const valueCursor = normalizeCursor(expiration.selectionStart);
  const rawCursor = valueIndexToRaw(valueCursor);

  if (rawCursor >= raw.length) {
    return;
  }

  const next = raw.slice(0, rawCursor) + raw.slice(rawCursor + 1);

  setValue(next);

  const nextCursor = rawIndexToValue(rawCursor);

  expiration.setSelectionRange(nextCursor, nextCursor);
}
