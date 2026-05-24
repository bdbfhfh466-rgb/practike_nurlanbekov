/* ============================================================
   School Practice Hub — script.js
   Основная логика: навигация, анимации, форма, тема
   ============================================================ */

// ─── 1. DOM-ССЫЛКИ ────────────────────────────────────────
const navbar      = document.getElementById('navbar');
const burger      = document.getElementById('burger');
const navLinks    = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const scrollTopBtn= document.getElementById('scrollTop');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

// ─── 2. NAVBAR: фиксация при скролле + активная ссылка ────
window.addEventListener('scroll', () => {
  // Добавляем фон при скролле > 60px
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Показываем/скрываем кнопку "Наверх"
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);

  // Подсвечиваем активную ссылку по секции
  updateActiveLink();
});

/**
 * Определяет, какая секция сейчас видна, и ставит класс .active
 * на соответствующую ссылку навигации.
 */
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });

  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
  });
}

// ─── 3. БУРГЕР-МЕНЮ (мобильное) ──────────────────────────
burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  // Блокируем скролл body когда меню открыто
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Закрываем меню при клике на ссылку
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── 4. ПЛАВНАЯ ПРОКРУТКА ────────────────────────────────
/**
 * Перехватываем клики по всем якорям #...
 * и скроллим к секции плавно.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── 5. КНОПКА "НАВЕРХ" ──────────────────────────────────
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── 6. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ───────────────────────────────
/**
 * Сохраняем выбор темы в localStorage,
 * чтобы при перезагрузке страница не мигала.
 */
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  // Меняем иконку
  themeIcon.className = theme === 'dark'
    ? 'fa-solid fa-moon'
    : 'fa-solid fa-sun';
}

// ─── 7. АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ (IntersectionObserver) ──
/**
 * Когда элемент с классом .reveal входит во viewport —
 * добавляем .visible для CSS-анимации.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Срабатывает один раз
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── 8. АНИМАЦИЯ ПРОГРЕСС-БАРОВ НАВЫКОВ ──────────────────
/**
 * Когда карточка навыка появляется — запускаем заполнение бара.
 */
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-fill');
        if (fill) {
          const width = fill.dataset.width || '0';
          // Небольшая задержка для визуального эффекта
          setTimeout(() => { fill.style.width = `${width}%`; }, 200);
        }
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.skill-card').forEach(card => barObserver.observe(card));

// ─── 9. СЧЁТЧИК ЦИФР В HERO-СЕКЦИИ ──────────────────────
/**
 * Анимируем числа от 0 до целевого значения.
 */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ─── 10. ВАЛИДАЦИЯ ФОРМЫ ─────────────────────────────────
/**
 * Проверяем поля перед отправкой.
 * Показываем ошибки под каждым полем.
 */
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateForm()) submitForm();
});

function validateForm() {
  let valid = true;

  // Имя: минимум 2 символа
  const name = document.getElementById('name');
  if (name.value.trim().length < 2) {
    showError('nameErr', name, 'Введите имя (минимум 2 символа)');
    valid = false;
  } else {
    clearError('nameErr', name);
  }

  // Email: простая проверка формата
  const email = document.getElementById('email');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.value.trim())) {
    showError('emailErr', email, 'Введите корректный email');
    valid = false;
  } else {
    clearError('emailErr', email);
  }

  // Тема: минимум 3 символа
  const subject = document.getElementById('subject');
  if (subject.value.trim().length < 3) {
    showError('subjectErr', subject, 'Тема слишком короткая');
    valid = false;
  } else {
    clearError('subjectErr', subject);
  }

  // Сообщение: минимум 10 символов
  const message = document.getElementById('message');
  if (message.value.trim().length < 10) {
    showError('messageErr', message, 'Сообщение слишком короткое (мин. 10 символов)');
    valid = false;
  } else {
    clearError('messageErr', message);
  }

  return valid;
}

function showError(errId, input, text) {
  document.getElementById(errId).textContent = text;
  input.closest('.form-group').classList.add('has-error');
}

function clearError(errId, input) {
  document.getElementById(errId).textContent = '';
  input.closest('.form-group').classList.remove('has-error');
}

// Очищаем ошибку при вводе
contactForm.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    const errId = field.id + 'Err';
    const errEl = document.getElementById(errId);
    if (errEl) {
      errEl.textContent = '';
      field.closest('.form-group').classList.remove('has-error');
    }
  });
});

/**
 * Имитируем отправку (в реальном проекте — fetch/axios к API).
 */
function submitForm() {
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Отправка...';

  // Имитация задержки сети
  setTimeout(() => {
    contactForm.reset();
    btn.disabled = false;
    btn.innerHTML = 'Отправить <i class="fa-solid fa-paper-plane"></i>';
    formSuccess.classList.add('show');

    // Убираем уведомление через 5 секунд
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }, 1500);
}

// ─── 11. ПАРАЛЛАКС БЛОБОВ в Hero (лёгкий эффект) ─────────
document.addEventListener('mousemove', (e) => {
  const { clientX, clientY } = e;
  const xRatio = clientX / window.innerWidth  - 0.5;
  const yRatio = clientY / window.innerHeight - 0.5;

  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  if (blob1) blob1.style.transform = `translate(${xRatio * 25}px, ${yRatio * 25}px) scale(1)`;
  if (blob2) blob2.style.transform = `translate(${xRatio * -20}px, ${yRatio * -20}px) scale(1)`;
});
