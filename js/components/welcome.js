/* 跟进卡节点提前缓存，后续 follow-card.js 直接复用。 */
const followCards = [...document.querySelectorAll('[data-follow-card]')];

/* 欢迎区打字机：每个会话只播一次，系统要求减少动效时直接跳过。 */
function runWelcomeIntro() {
  const welcome = document.querySelector('[data-typewriter="true"]');
  const platform = document.body.classList.contains('platform-android') ? 'android' : 'ios';
  const seenClass = `platform-${platform}-welcome-seen`;
  const seenKey = `sales-${platform}-welcome-seen`;
  if (!welcome || document.body.classList.contains(seenClass) || window.sessionStorage.getItem(seenKey) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lines = [...welcome.querySelectorAll('[data-typewriter-line]')];
  const originals = lines.map((line) => line.textContent);
  document.body.classList.add('is-playing-welcome');
  lines.forEach((line) => { line.textContent = ''; line.classList.add('is-typing'); });
  let lineIndex = 0;
  let charIndex = 0;
  const typeNext = () => {
    if (lineIndex >= lines.length) {
      /* 播完后写入 sessionStorage，刷新本会话不再重播。 */
      lines.forEach((line) => line.classList.remove('is-typing'));
      document.body.classList.remove('is-playing-welcome');
      document.body.classList.add(seenClass);
      window.sessionStorage.setItem(seenKey, '1');
      return;
    }
    const line = lines[lineIndex];
    line.textContent = originals[lineIndex].slice(0, charIndex + 1);
    charIndex += 1;
    if (charIndex >= originals[lineIndex].length) {
      line.classList.remove('is-typing');
      lineIndex += 1;
      charIndex = 0;
      window.setTimeout(typeNext, 180);
      return;
    }
    window.setTimeout(typeNext, 72);
  };
  typeNext();
}

runWelcomeIntro();

/* 欢迎区滚出可视区域后暂停眨眼/扫光，避免后台空转动画。 */
const welcomeModule = document.querySelector('.ios-welcome, .android-welcome');
if (welcomeModule && 'IntersectionObserver' in window) {
  const welcomeObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('is-welcome-offscreen', !entry.isIntersecting);
  }, { root: document.querySelector('.mobile-content'), threshold: 0 });
  welcomeObserver.observe(welcomeModule);
}
