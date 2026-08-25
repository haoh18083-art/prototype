/* 底栏：今日可点选中，其余 Tab 只提示「下一版开放」。 */
document.querySelectorAll('[data-bottom-nav]').forEach((nav) => {
  nav.querySelectorAll('[data-nav-item]').forEach((item) => {
    item.addEventListener('click', () => {
      nav.querySelectorAll('[data-nav-item]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === item));
      if (item.dataset.navItem !== 'today') showToast(`${item.textContent.trim()}页面将在下一版开放`);
    });
  });
});

/* 初始化收件箱可见项，保证默认停在「未处理」。 */
refreshInbox();
