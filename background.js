chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;
  const url = tab.url;

  // document.title を取得
  const [{ result: rawTitle }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.title
  });
  // 先頭の("数値")を除去
  let title = rawTitle.replace(/^\([0-9]+\)\s*/, "").trim();

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
