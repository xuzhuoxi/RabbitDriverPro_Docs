// 打开本机 _site 里已有的两份全量手册，等两页都加载完再打印。
// 不通过 www.xuzhuoxi.com 打开页面；HTML 里指向该域名的资源改写到本机站点。
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

const localOrigin = new URL(origin);
if (localOrigin.hostname === 'www.xuzhuoxi.com' || localOrigin.hostname === 'xuzhuoxi.com') {
  console.error(`SITE_ORIGIN 不能是 ${origin}`);
  process.exit(1);
}

function toLocalUrl(rawUrl) {
  const target = new URL(rawUrl);
  if (target.hostname !== 'www.xuzhuoxi.com' && target.hostname !== 'xuzhuoxi.com') {
    return null;
  }
  let pathname = target.pathname;
  const prefix = '/RabbitDriverPro_Docs';
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    pathname = pathname.slice(prefix.length) || '/';
  }
  return new URL(`${pathname}${target.search}`, localOrigin).href;
}

const jobs = [
  {
    name: '中文手册',
    url: new URL('/pages/Manual_Full_cn.html', origin).href,
    file: path.join(pdfDir, 'RabbitDriverPro-Manual_cn.pdf'),
  },
  {
    name: '英文手册',
    url: new URL('/pages/Manual_Full_en.html', origin).href,
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
    const pageHost = new URL(job.url).hostname;
    if (pageHost === 'www.xuzhuoxi.com' || pageHost === 'xuzhuoxi.com') {
      throw new Error(`${job.name} 不能通过 ${job.url} 打开。`);
    }
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const localUrl = toLocalUrl(request.url());
      if (!localUrl) {
        request.continue();
        return;
      }
      console.log(`改写 ${request.url()} -> ${localUrl}`);
      request.continue({ url: localUrl });
    });
    const response = await page.goto(job.url, { waitUntil: 'load', timeout: 180000 });
    const status = response ? response.status() : 0;
    if (!response || status >= 400) {
      throw new Error(`${job.name} 打开失败：${job.url}（HTTP ${status}）`);
    }
    const finalHost = new URL(page.url()).hostname;
    if (finalHost === 'www.xuzhuoxi.com' || finalHost === 'xuzhuoxi.com') {
      throw new Error(`${job.name} 被重定向到 ${page.url()}`);
    }
    await waitUntilFullyLoaded(page);
    console.log(`已加载：${job.url}`);
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
