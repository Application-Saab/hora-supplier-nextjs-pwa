'use client';

// "Order alerts" panel: checks every phone setting that can silence the new-order
// sound and gives a one-tap button to fix each one. It re-checks automatically
// when the user comes back from the settings screen.
//
// Use <NotificationSetup /> on a settings page, and <NotificationSetup compact />
// at the top of your home/orders screen: compact mode only appears when there is a problem.

import { useCallback, useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import NotificationHealth from '../lib/notificationHealth';
import { ORDER_CHANNEL_ID } from '../lib/pushConfig';
import {
  isNativeAndroid,
  ensureOrderChannel,
  requestPermissionAndRegister,
} from '../lib/push';

// Brands that kill closed apps unless "Autostart" / "Background activity" is allowed.
const AGGRESSIVE_OEMS = [
  'xiaomi', 'redmi', 'poco', 'oppo', 'realme', 'oneplus', 'vivo', 'iqoo',
  'huawei', 'honor', 'asus', 'letv', 'meizu', 'tecno', 'infinix', 'itel', 'samsung',
];
const AUTOSTART_DONE_KEY = 'orderAlerts.autostartConfirmed';

function readFlag(key) {
  try { return window.localStorage.getItem(key) === '1'; } catch { return false; }
}
function writeFlag(key) {
  try { window.localStorage.setItem(key, '1'); } catch {}
}

async function loadStatus() {
  const [{ receive }, health] = await Promise.all([
    PushNotifications.checkPermissions(),
    NotificationHealth.getStatus({ channelId: ORDER_CHANNEL_ID }),
  ]);
  return { permission: receive, ...health };
}

function buildIssues(s, autostartConfirmed) {
  const issues = [];
  if (!s) return issues;

  const canAsk = s.permission === 'prompt' || s.permission === 'prompt-with-rationale';
  if (canAsk) {
    issues.push({
      id: 'permission', level: 'critical',
      title: 'Allow notifications',
      text: 'You will not hear new orders until notifications are allowed.',
      action: 'Allow', run: 'ask',
    });
  } else if (s.permission === 'denied' || !s.notificationsEnabled) {
    issues.push({
      id: 'blocked', level: 'critical',
      title: 'Notifications are turned off',
      text: 'Open settings and switch on "Allow notifications" for this app.',
      action: 'Open settings', run: 'notificationSettings',
    });
  } else if (s.channelExists && !s.channelEnabled) {
    issues.push({
      id: 'channel-off', level: 'critical',
      title: '"New orders" alerts are turned off',
      text: 'Open settings and switch on the "New orders" category.',
      action: 'Open settings', run: 'notificationSettings',
    });
  } else if (s.channelExists && !s.channelHasSound) {
    issues.push({
      id: 'channel-silent', level: 'warning',
      title: 'New-order sound is muted',
      text: 'In settings, set "New orders" to "Alerting" / "Sound" so the order tone plays.',
      action: 'Open settings', run: 'notificationSettings',
    });
  }

  if (!s.batteryOptimizationIgnored) {
    issues.push({
      id: 'battery', level: 'warning',
      title: 'Allow running in background',
      text: 'Battery saver can delay or block alerts when the app is closed. Choose "Allow" / "Unrestricted".',
      action: 'Allow', run: 'battery',
    });
  }
  if (s.backgroundRestricted) {
    issues.push({
      id: 'restricted', level: 'warning',
      title: 'Background use is restricted',
      text: 'Open App info > Battery and choose "Unrestricted".',
      action: 'Open app info', run: 'appSettings',
    });
  }

  const brand = `${s.manufacturer || ''} ${s.brand || ''}`;
  if (!autostartConfirmed && AGGRESSIVE_OEMS.some((b) => brand.includes(b))) {
    issues.push({
      id: 'autostart', level: 'info',
      title: 'Turn on Autostart',
      text: 'Your phone may stop closed apps. Enable "Autostart" / "Allow background activity" for this app, then tap "Done".',
      action: 'Open settings', run: 'autostart', confirmable: true,
    });
  }

  if (s.dndActive) {
    issues.push({
      id: 'dnd', level: 'info',
      title: 'Do Not Disturb is on',
      text: 'Order alerts may be silent until Do Not Disturb is turned off.',
    });
  }
  return issues;
}

export default function NotificationSetup({ compact = false }) {
  const [status, setStatus] = useState(null);
  const [autostartConfirmed, setAutostartConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const native = typeof window !== 'undefined' && isNativeAndroid();

  const refresh = useCallback(async () => {
    if (!isNativeAndroid()) return;
    try {
      await ensureOrderChannel();
      setStatus(await loadStatus());
    } catch (err) {
      console.error('[NotificationSetup]', err);
    }
  }, []);

  useEffect(() => {
    setAutostartConfirmed(readFlag(AUTOSTART_DONE_KEY));
    refresh();
    // Re-check when the user returns from a settings screen.
    let handle;
    App.addListener('appStateChange', ({ isActive }) => { if (isActive) refresh(); })
      .then((h) => { handle = h; });
    return () => { if (handle) handle.remove(); };
  }, [refresh]);

  const run = async (issue) => {
    setBusy(true);
    setMessage('');
    try {
      if (issue.run === 'ask') {
        const result = await requestPermissionAndRegister();
        // Android stops showing the dialog after the user refuses twice -> send to settings.
        if (result === 'denied') await NotificationHealth.openNotificationSettings({ channelId: ORDER_CHANNEL_ID });
      } else if (issue.run === 'notificationSettings') {
        await NotificationHealth.openNotificationSettings({ channelId: ORDER_CHANNEL_ID });
      } else if (issue.run === 'battery') {
        await NotificationHealth.requestIgnoreBatteryOptimization();
      } else if (issue.run === 'autostart') {
        const r = await NotificationHealth.openAutoStartSettings();
        if (r.screen === 'app_details') {
          setMessage('Look for "Autostart", "Background activity" or "Battery > Unrestricted" on this screen.');
        }
      } else if (issue.run === 'appSettings') {
        await NotificationHealth.openAppSettings();
      }
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const confirmAutostart = () => {
    writeFlag(AUTOSTART_DONE_KEY);
    setAutostartConfirmed(true);
  };


  <div style={{
    position: 'fixed',
    top: 10,
    left: 10,
    zIndex: 999999,
    background: 'yellow',
    color: 'black',
    padding: 12
  }}>
    NotificationSetup loaded
  </div>


  if (!native) {
    if (compact) return null;
    return (
      <section className="ns-card">
        <h2>Order alerts</h2>
        <p className="ns-muted">Open this screen inside the Android app to check notification settings.</p>
      </section>
    );
  }

  if (!status) return compact ? null : <section className="ns-card"><p className="ns-muted">Checking notification settings…</p></section>;

  const issues = buildIssues(status, autostartConfirmed);
  const blocking = issues.filter((i) => i.level !== 'info');

  if (compact && issues.length === 0) return null;
  const shown = compact ? issues.slice(0, 1) : issues;

  return (
    <section className={`ns-card ${blocking.length ? 'ns-has-problem' : 'ns-ok'}`}>
      {!compact && <h2>Order alerts</h2>}

      {blocking.length === 0 && !compact && (
        <p className="ns-good">✓ New-order alerts with sound are on.</p>
      )}

      {shown.map((issue) => (
        <div key={issue.id} className={`ns-issue ns-${issue.level}`}>
          <div>
            <strong>{issue.title}</strong>
            <p>{issue.text}</p>
          </div>
          <div className="ns-actions">
            {issue.action && (
              <button disabled={busy} onClick={() => run(issue)}>{issue.action}</button>
            )}
            {issue.confirmable && (
              <button className="ns-secondary" onClick={confirmAutostart}>Done</button>
            )}
          </div>
        </div>
      ))}

      {compact && issues.length > 1 && (
        <p className="ns-muted">+{issues.length - 1} more setting(s) in Settings › Order alerts</p>
      )}
      {message && <p className="ns-muted">{message}</p>}
    </section>
  );
}
