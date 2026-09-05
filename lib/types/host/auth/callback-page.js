/** Self-contained OAuth loopback result pages (no external assets). */
const COPY = {
    'zh-CN': {
        success: {
            title: '授权成功',
            message: 'SupaNexus 已连接，可以返回应用继续使用。',
            hint: '若窗口未自动关闭，请手动关闭此标签页。',
            autoClose: '窗口将在 {seconds} 秒后自动关闭…',
        },
        error: {
            title: '授权失败',
            message: '未能完成 SupaNexus 快速配置。',
            hint: '请关闭此窗口，返回应用后点击「重新打开授权页」重试。',
            autoClose: '',
        },
    },
    'en-US': {
        success: {
            title: 'Authorization complete',
            message: 'SupaNexus is connected. You can return to the app.',
            hint: 'If this tab does not close automatically, close it manually.',
            autoClose: 'This tab will close in {seconds}s…',
        },
        error: {
            title: 'Authorization failed',
            message: 'SupaNexus quick setup could not be completed.',
            hint: 'Close this tab, return to the app, and choose Reopen authorization.',
            autoClose: '',
        },
    },
};
/** Normalize flow locale to a supported callback page language. */
export function callbackLocale(locale) {
    return locale?.startsWith('zh') ? 'zh-CN' : 'en-US';
}
/** Escape text for safe HTML interpolation. */
export function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&#39;');
}
function pageShell(kind, locale, detail, autoCloseSeconds) {
    const copy = COPY[locale][kind];
    const accent = kind === 'success' ? '#1212F9' : '#DC2626';
    const icon = kind === 'success'
        ? '<path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
        : '<path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    const countdown = autoCloseSeconds !== undefined && copy.autoClose.length > 0
        ? `<p class="countdown" id="countdown">${escapeHtml(copy.autoClose.replace('{seconds}', String(autoCloseSeconds)))}</p>`
        : '';
    const autoCloseScript = kind === 'success'
        ? `<script>
(function () {
  var seconds = ${String(autoCloseSeconds ?? 3)};
  var countdown = document.getElementById('countdown');
  function tick() {
    if (countdown) {
      countdown.textContent = ${JSON.stringify(copy.autoClose)}.replace('{seconds}', String(seconds));
    }
    if (seconds <= 0) {
      window.close();
      return;
    }
    seconds -= 1;
    window.setTimeout(tick, 1000);
  }
  window.setTimeout(tick, 1000);
  window.close();
})();
</script>`
        : '';
    return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SupaNexus · ${escapeHtml(copy.title)}</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
        color: #e2e8f0;
      }
      .card { background: #111827; border-color: #1f2937; }
      .detail { color: #cbd5e1; }
      .hint { color: #94a3b8; }
    }
    .card {
      width: min(100%, 420px);
      padding: 28px 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
    .mark {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border-radius: 12px;
      background: ${accent};
      display: grid;
      place-items: center;
      color: #fff;
    }
    .mark svg { width: 28px; height: 28px; }
    h1 {
      margin: 0 0 8px;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .detail {
      margin: 0 0 8px;
      font-size: 0.95rem;
      line-height: 1.5;
      color: #334155;
    }
    .error-detail {
      margin: 12px 0 0;
      padding: 12px;
      border-radius: 10px;
      background: rgba(220, 38, 38, 0.08);
      color: #b91c1c;
      font-size: 0.875rem;
      line-height: 1.45;
      text-align: left;
      word-break: break-word;
    }
    .hint, .countdown {
      margin: 12px 0 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: #64748b;
    }
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>
    </div>
    <h1>${escapeHtml(copy.title)}</h1>
    <p class="detail">${escapeHtml(copy.message)}</p>
    ${kind === 'error' ? `<p class="error-detail">${escapeHtml(detail)}</p>` : ''}
    <p class="hint">${escapeHtml(copy.hint)}</p>
    ${countdown}
  </main>
  ${autoCloseScript}
</body>
</html>`;
}
/** Render the OAuth success page shown after quick setup completes. */
export function renderSuccessPage(locale) {
    return pageShell('success', callbackLocale(locale), '', 3);
}
/** Render the OAuth error page with a safe, escaped detail message. */
export function renderErrorPage(message, locale) {
    return pageShell('error', callbackLocale(locale), message);
}
//# sourceMappingURL=callback-page.js.map