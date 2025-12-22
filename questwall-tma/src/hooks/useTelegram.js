import { useEffect, useState } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const app = window.Telegram.WebApp;
      app.ready();
      app.expand();
      setTg(app);

      const initDataUnsafe = app.initDataUnsafe || {};
      if (initDataUnsafe.user) {
        setUser(initDataUnsafe.user);
      }

      setInitData(app.initData || '');

      console.log('Telegram WebApp 初始化成功');
      console.log('用户信息:', initDataUnsafe.user);
    } else {
      console.log('非 Telegram 环境，使用开发模式');
    }
  }, []);

  return { tg, user, initData };
}
