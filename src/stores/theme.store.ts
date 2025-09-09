import { defineStore } from 'pinia';

type ThemeMode = 'light' | 'dark' | 'system';
const LS_KEY = 'theme:mode';

function getSystemPrefersDark(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system' as ThemeMode,
    _mql: null as MediaQueryList | null,
  }),
  actions: {
    init() {
      // 1) 저장된 모드 복원
      const saved = (localStorage.getItem(LS_KEY) as ThemeMode | null) ?? 'system';
      this.mode = saved;

      // 2) 시스템 변경 리스너 등록 (system 모드일 때만)
      if (window.matchMedia) {
        this._mql = window.matchMedia('(prefers-color-scheme: dark)');
        this._mql.addEventListener?.('change', this._onSystemChange);
      }

      // 3) 적용
      this.applyTheme();
    },
    setTheme(next: ThemeMode) {
      this.mode = next;
      localStorage.setItem(LS_KEY, next);
      this.applyTheme();
    },
    toggleCycle() {
      // light -> dark -> system -> light ...
      const order: ThemeMode[] = ['light', 'dark', 'system'];
      const idx = order.indexOf(this.mode);
      const next = order[(idx + 1) % order.length];
      this.setTheme(next);
    },
    applyTheme() {
      const isDark = this.mode === 'dark' || (this.mode === 'system' && getSystemPrefersDark());
      const root = document.documentElement;
      root.classList.toggle('theme-dark', isDark);

      // color-scheme 힌트(폼/스크롤바 등 브라우저 기본 위젯 대비 개선)
      // @ts-ignore
      root.style.colorScheme = isDark ? 'dark' : 'light';
    },
    _onSystemChange() {
      // system 모드에서만 반응
      // @ts-ignore
      if (this.mode === 'system') this.applyTheme();
    },
  },
});