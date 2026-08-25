/* 本周经营横滑：键盘左右键一次滚动一张卡片宽度。 */
const performanceTrack = document.querySelector('.ios-performance-track, .android-performance-track');
performanceTrack?.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  performanceTrack.scrollBy({ left: event.key === 'ArrowRight' ? 218 : -218, behavior: 'smooth' });
});
