type RouterLike = {
  canGoBack?: () => boolean;
  back: () => void;
  replace: (href: string) => void;
};

export function safeRouterBack(router: RouterLike, fallbackRoute = '/') {
  try {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }
  } catch {
    // Fall through to safe redirect.
  }

  router.replace(fallbackRoute);
}