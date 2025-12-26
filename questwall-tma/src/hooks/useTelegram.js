import { useEffect, useState } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [startParam, setStartParam] = useState(null);

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

      // 获取 start_param（邀请码等）
      // Telegram 通过 initDataUnsafe.start_param 传递 bot link 的 start 参数
      const param = initDataUnsafe.start_param || null;
      if (param) {
        console.log('获取到 start_param:', param);
        setStartParam(param);
      }

      console.log('Telegram WebApp 初始化成功');
      console.log('用户信息:', initDataUnsafe.user);
      console.log('start_param:', param);
    } else {
      console.log('非 Telegram 环境，使用开发模式');
    }
  }, []);

  return { tg, user, initData, startParam };
}
