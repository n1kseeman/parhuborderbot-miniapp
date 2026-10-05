(() => {
  const webApp = window.Telegram?.WebApp;
  const user = webApp?.initDataUnsafe?.user || null;
  const isTelegram = Boolean(webApp?.initData && user);

  function activeView() {
    return document.querySelector('.view.active')?.id?.replace('View', '') || 'shop';
  }

  function openModal() {
    return document.querySelector('.modal.open');
  }

  function syncBackButton() {
    if (!webApp?.BackButton) return;
    if (openModal() || activeView() !== 'shop') webApp.BackButton.show();
    else webApp.BackButton.hide();
  }

  function closeTopLayer() {
    const modal = openModal();
    if (modal) {
      modal.classList.remove('open');
      syncBackButton();
      return;
    }
    if (activeView() !== 'shop' && typeof window.setView === 'function') {
      const profileChildren = ['orders', 'help', 'admin'];
      window.setView(profileChildren.includes(activeView()) ? 'profile' : 'shop');
    }
  }

  function updateProfile() {
    const name = document.querySelector('#profileName');
    const status = document.querySelector('#profileStatus');
    const avatar = document.querySelector('#profileAvatar');
    if (!name || !status || !avatar) return;

    if (!user) {
      status.textContent = 'Режим предпросмотра';
      return;
    }

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    name.textContent = fullName || user.username || 'Пользователь Telegram';
    status.textContent = user.username ? `@${user.username}` : 'Вход через Telegram';
    avatar.textContent = (user.first_name || user.username || 'T').slice(0, 1).toUpperCase();
    const checkoutName = document.querySelector('#checkoutForm [name="name"]');
    if (checkoutName && !checkoutName.value) checkoutName.value = fullName;
    if (user.photo_url) {
      avatar.style.backgroundImage = `url("${user.photo_url.replaceAll('"', '')}")`;
      avatar.classList.add('has-photo');
    }
  }

  function initializeTelegram() {
    if (!webApp) return;
    webApp.ready();
    webApp.expand();
    if (webApp.isVersionAtLeast?.('7.7')) webApp.disableVerticalSwipes?.();
    webApp.setHeaderColor('#09070d');
    webApp.setBackgroundColor('#09070d');
    if (webApp.isVersionAtLeast?.('7.10')) webApp.setBottomBarColor('#100d14');
    webApp.BackButton?.onClick(closeTopLayer);
    webApp.onEvent?.('themeChanged', () => {
      document.documentElement.dataset.telegramTheme = webApp.colorScheme || 'dark';
    });
    const cartCount = Number(document.querySelector('#cartBadge')?.textContent || 0);
    if (webApp.isVersionAtLeast?.('6.2') && cartCount > 0) {
      webApp.enableClosingConfirmation?.();
    }
  }

  function requireAuth() {
    if (isTelegram) return true;
    document.querySelector('#telegramAuthModal')?.classList.add('open');
    syncBackButton();
    return false;
  }

  window.ParHubTelegram = {
    webApp,
    user,
    isTelegram,
    initData: webApp?.initData || '',
    requireAuth,
  };

  document.documentElement.classList.toggle('telegram-app', isTelegram);
  document.documentElement.classList.toggle('browser-preview', !isTelegram);
  updateProfile();
  initializeTelegram();
  syncBackButton();

  document.addEventListener('parhub:viewchange', syncBackButton);
  document.addEventListener('parhub:modalchange', syncBackButton);
  document.addEventListener('parhub:cartchange', event => {
    if (!webApp?.isVersionAtLeast?.('6.2')) return;
    if (event.detail?.count > 0) webApp.enableClosingConfirmation?.();
    else webApp.disableClosingConfirmation?.();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('button')) return;
    webApp?.HapticFeedback?.impactOccurred('light');
  }, { capture: true });
})();
