/* Web 端内嵌聊天：建议词填入输入框；发送只出提示，不接真实接口。 */
document.querySelectorAll('[data-suggestion]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.querySelector('[data-chat-input]');
    if (!input) return;
    input.value = button.textContent.trim();
    input.focus();
  });
});

document.querySelectorAll('[data-send-chat]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.querySelector('[data-chat-input]');
    if (!input?.value.trim()) return;
    showToast('已记录你的问题，助手正在准备回答');
    input.value = '';
  });
});
