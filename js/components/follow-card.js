/* 跟进卡：点整卡或箭头展开；点「客户空间」只出提示，不跳转。 */
followCards.forEach((card) => {
  const toggle = card.querySelector('[data-follow-toggle]');
  const navigate = card.querySelector('[data-space-link]');
  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    card.classList.toggle('is-expanded');
  });
  card.addEventListener('click', (event) => {
    if (event.target.closest('[data-space-link]') || event.target.closest('[data-follow-toggle]')) return;
    card.classList.toggle('is-expanded');
  });
  navigate?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(`正在打开${card.dataset.customer}的客户空间`);
  });
});
