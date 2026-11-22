// 打开当前仓库 GitHub Pages 上的两份全量手册，等两页都加载完再打印。
// 站点根由仓库名拼出，页面路径是 pages/Manual_Full_*.html。
// 打印设置对齐 Chrome 打印对话框：A4、每张纸 1 页、边距默认（1cm）、缩放默认（1）、保留页眉页脚。
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const origin = process.env.SITE_ORIGIN;
const pdfDir = process.env.PDF_DIR;
if (!origin || !pdfDir) {
  console.error('缺少 SITE_ORIGIN 或 PDF_DIR。');
  process.exit(1);
}

const pagesRoot = origin.endsWith('/') ? origin : `${origin}/`;
const jobs = [
  {
    name: '中文手册',
    url: new URL('pages/Manual_Full_cn.html', pagesRoot).href,
    file: path.join(pdfDir, 'RabbitDriverPro-Manual_cn.pdf'),
  },
  {
    name: '英文手册',
    url: new URL('pages/Manual_Full_en.html', pagesRoot).href,
    file: path.join(pdfDir, 'RabbitDriverPro-Manual_en.pdf'),
  },
];

// Chrome 页眉页脚模板默认字号为 0，必须写明字号才会显示。
// 内容与打印对话框勾选「页眉和页脚」时一致：日期、标题、网址、页码。
const headerTemplate = `
<div style="font-size:8px; width:100%; padding:0 8px; box-sizing:border-box; display:flex; justify-content:space-between;">
  <span class="date"></span>
  <span class="title"></span>
</div>`;
const footerTemplate = `
<div style="font-size:8px; width:100%; padding:0 8px; box-sizing:border-box; display:flex; justify-content:space-between;">
  <span class="url"></span>
  <span><span class="pageNumber"></span>/<span class="totalPages"></span></span>
</div>`;

async function waitUntilFullyLoaded(page) {
  await page.evaluate(async () => {
    if (document.readyState !== 'complete') {
      await new Promise((resolve) => {
        window.addEventListener('load', resolve, { once: true });
      });
    }
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    const pending = Array.from(document.images).filter((img) => !img.complete);
    await Promise.all(pending.map((img) => new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    })));
  });
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const loaded = await Promise.all(jobs.map(async (job) => {
    const page = await browser.newPage();
    const response = await page.goto(job.url, { waitUntil: 'load', timeout: 180000 });
    const status = response ? response.status() : 0;
    if (!response || status >= 400) {
      throw new Error(`${job.name} 打开失败：${job.url}（HTTP ${status}）`);
    }
    await waitUntilFullyLoaded(page);
    console.log(`已加载：${page.url()}`);
    return { page, job };
  }));

  await mkdir(pdfDir, { recursive: true });
  for (const { page, job } of loaded) {
    // format:A4 即每张纸一页。printToPDF 没有「每张纸多页」选项。
    // 不传 printBackground：与打印对话框默认不勾选背景图形一致。
    await page.pdf({
      path: job.file,
      format: 'A4',
      scale: 1,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
      },
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      preferCSSPageSize: false,
      printBackground: false,
    });
    console.log(`已打印：${job.file}`);
  }
} finally {
  await browser.close();
}
