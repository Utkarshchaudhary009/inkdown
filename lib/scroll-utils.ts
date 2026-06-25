export function getScrollPercentage(): number {
  if (typeof window === 'undefined') return 0;
  const scrollY = window.scrollY;
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  return totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
}

export function scrollToPercentage(percent: number, smooth: boolean = true): void {
  if (typeof window === 'undefined') return;
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const targetScrollY = (percent / 100) * totalHeight;
  window.scrollTo({ top: targetScrollY, behavior: smooth ? 'smooth' : 'instant' });
}

export function getViewportHeight(): number {
  return typeof window !== 'undefined' ? window.innerHeight : 0;
}
