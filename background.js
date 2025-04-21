chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // document.title と window.location.href を取得
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      title: document.title,
      url: window.location.href
    })
  });
  // 先頭の("数値")を除去
  let title = result.title.replace(/^\(\d+\+?\)\s*/, "").trim();
  let url = result.url;

  // 各フォーマット生成
  const html = `<a href="${url}">${title}</a>`;
  const markdown = `[${title}](${url})`;
  const text = `${url}`;

  // クリップボードへ複数MIMEタイプでコピーするためにcontent script経由で実行
  await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: (html, markdown, text) => {
      function copyToClipboard(html, markdown, text) {
        const listener = (e) => {
          e.clipboardData.setData('text/html', html);
          e.clipboardData.setData('text/markdown', markdown);
          e.clipboardData.setData('text/plain', text);
          e.preventDefault();
        };
        document.addEventListener('copy', listener, {once: true});
        document.execCommand('copy');
      }
      copyToClipboard(html, markdown, text);
    },
    args: [html, markdown, text]
  });
});
