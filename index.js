var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var import_axios = __toESM(require("axios"));
var cheerio = __toESM(require("cheerio"));
var import_url = require("url");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var X2JS = require("x2js");
var x2js = new X2JS();
var logger = new import_koishi.Logger("rss-sc");
var name = "rss-sc";
var inject = { required: ["database"], optional: ["puppeteer", "censor"] };
var debugLevel = ["disable", "error", "info", "details"];
var templateList = ["auto", "content", "only text", "only media", "only image", "only video", "proto", "default", "only description", "custom", "link"];
var Config = import_koishi.Schema.object({
  basic: import_koishi.Schema.object({
    defaultTemplate: import_koishi.Schema.union(templateList).description("默认消息解析模板 <br> `auto` ★ 当文字长度小于`300`时使用content，否则custom<br> `content` ★ 可自定义的基础模板，适用于文字较少的订阅，无需puppeteer<br>`only text` 仅推送文字，无需puppeteer<br>`only media` 仅推送图片和视频，无需puppeteer<br>`only image` 仅推送图片，无需puppeteer<br>`only video` 仅推送视频，无需puppeteer<br>`proto` 推送原始内容，无需puppeteer<br>`default` ★ 内置基础puppeteer模板<br>`only description` 内置puppeteer模板，仅包含description内容<br>`custom` ★ 可自定义puppeteer模板，添加了护眼的背景色及订阅信息，见下方模板设置<br>`link` 特殊puppeteer模板，截图内容中首个a标签网址的页面<br>在订阅时使用自定义配置时无需only字段，例:`rsso -i text <url>`使用only text模板").default("content"),
    timeout: import_koishi.Schema.number().description("请求数据的最长时间（秒）").default(60),
    refresh: import_koishi.Schema.number().description("刷新订阅源的时间间隔（秒）").default(600),
    authority: import_koishi.Schema.number().min(1).max(5).description("基础指令的权限等级(包括添加,删除订阅等在help中标注为*的行为)").default(1),
    advancedAuthority: import_koishi.Schema.number().min(1).max(5).description("高级指令的权限等级(包括跨群添加,全员提醒等在help中标注为**的行为)").default(4),
    merge: import_koishi.Schema.union(["不合并", "有多条更新时合并", "一直合并"]).description("合并消息规则").default("有多条更新时合并"),
    maxRssItem: import_koishi.Schema.number().description("限制更新时的最大推送数量上限，超出上限时较早的更新会被忽略").default(10),
    firstLoad: import_koishi.Schema.boolean().description("首次订阅时是否发送最后的更新").default(true),
    urlDeduplication: import_koishi.Schema.boolean().description("同群组中不允许重复添加相同订阅").default(true),
    resendUpdataContent: import_koishi.Schema.union(["disable", "latest", "all"]).description("当内容更新时再次发送").default("disable").experimental(),
    imageMode: import_koishi.Schema.union(["base64", "File"]).description("图片发送模式，使用File可以解决部分图片无法发送的问题，但无法在沙盒中使用").default("base64"),
    videoMode: import_koishi.Schema.union(["filter", "href", "base64", "File"]).description("视频发送模式（iframe标签内的视频无法处理）<br> `filter` 过滤视频，含有视频的推送将不会被发送<br> `href` 使用视频网络地址直接发送<br> `base64` 下载后以base64格式发送<br> `File` 下载后以文件发送").default("href"),
    margeVideo: import_koishi.Schema.boolean().default(false).description("以合并消息发送视频"),
    usePoster: import_koishi.Schema.boolean().default(false).description("加载视频封面"),
    autoSplitImage: import_koishi.Schema.boolean().description("垂直拆分大尺寸图片，解决部分适配器发不出长图的问题").default(true),
    cacheDir: import_koishi.Schema.string().description("File模式时使用的缓存路径").default("data/cache/rsssc"),
    replaceDir: import_koishi.Schema.string().description("缓存替换路径，仅在使用docker部署时需要设置").default(""),
    sendMode: import_koishi.Schema.union(["merge", "each"]).description("推送模式，merge为合并推送，each为逐条推送").default("each"), // 新增配置项
  }).description("基础设置"),
  template: import_koishi.Schema.object({
    bodyWidth: import_koishi.Schema.number().description("puppeteer图片的宽度(px)，较低的值可能导致排版错误，仅在非custom的模板生效").default(600),
    bodyPadding: import_koishi.Schema.number().description("puppeteer图片的内边距(px)仅在非custom的模板生效").default(20),
    bodyFontSize: import_koishi.Schema.number().description("puppeteer图片的字号(px)，0为默认值，仅在非custom的模板生效").default(0),
    content: import_koishi.Schema.string().role("textarea", { rows: [4, 2] }).default(`《{{title}}》
{{description}}`).description("content模板的内容，使用插值载入推送内容"),
    custom: import_koishi.Schema.string().role("textarea", { rows: [4, 2] }).default(`<body style="width:600px;padding:20px;background:#F5ECCD;">
      <div style="display: flex;flex-direction: column;">
          <div style="backdrop-filter: blur(5px) brightness(0.7) grayscale(0.1);display: flex;align-items: center;flex-direction: column;border-radius: 10px;border: solid;overflow:hidden">
              <div style="display: flex;align-items: center;">
                  <img src="{{rss.channel.image.url}}" style="margin-right: 10px;object-fit: scale-down;max-height: 160px;max-width: 160px;" alt="" srcset="" />
                  <p style="font-size: 20px;font-weight: bold;color: white;">{{rss.channel.title}}</p>
              </div>
              <p style="color: white;font-size: 16px;">{{rss.channel.description}}</p>
          </div>
          <div style="font-weight: bold;">{{title}}</div>
          <div>{{pubDate}}</div>
          <div>{{description}}</div>
      </div>
  </body>`).description("custom模板的内容，使用插值载入推送内容。 [说明](https://github.com/borraken/koishi-plugin-rss-sc?tab=readme-ov-file#3-%E6%8F%92%E5%80%BC%E8%AF%B4%E6%98%8E)"),
    customRemark: import_koishi.Schema.string().role("textarea", { rows: [3, 2] }).default(`{{description}}
{{link}}`).description("custom模板的文字补充，以custom图片作为description再次插值")
    // customTemplate:Schema.array(Schema.object({
    //   name: Schema.string().description('模板名称'),
    //   pptr: Schema.boolean().description('是否pptr模板'),
    //   content: Schema.string().description('模板内容').default(`{{description}}`).role('textarea'),
    //   remark: Schema.string().description('模板补充内容').default(`{{description}}`).role('textarea'),
    // })).description('自定义新模板'),
  }).description("模板设置"),
  net: import_koishi.Schema.object({
    proxyAgent: import_koishi.Schema.intersect([
      import_koishi.Schema.object({ enabled: import_koishi.Schema.boolean().default(false).description("使用代理") }),
      import_koishi.Schema.union([import_koishi.Schema.object({
        enabled: import_koishi.Schema.const(true).required(),
        autoUseProxy: import_koishi.Schema.boolean().default(false).description("新订阅自动判断代理").experimental(),
        protocol: import_koishi.Schema.union(["http", "https", "socks5"]).default("http"),
        host: import_koishi.Schema.string().role("link").default("127.0.0.1"),
        port: import_koishi.Schema.number().default(7890),
        auth: import_koishi.Schema.intersect([
          import_koishi.Schema.object({ enabled: import_koishi.Schema.boolean().default(false) }),
          import_koishi.Schema.union([import_koishi.Schema.object({
            enabled: import_koishi.Schema.const(true).required(),
            username: import_koishi.Schema.string(),
            password: import_koishi.Schema.string()
          }), import_koishi.Schema.object({})])
        ])
      }), import_koishi.Schema.object({})])
    ]),
    userAgent: import_koishi.Schema.string()
  }).description("网络设置"),
  msg: import_koishi.Schema.object({
    rssHubUrl: import_koishi.Schema.string().role("link").description("使用快速订阅时rssHub的地址，你可以使用`rsso -q`检查可用的快速订阅").default("https://hub.slarker.me"),
    keywordFilter: import_koishi.Schema.array(import_koishi.Schema.string()).role("table").description("关键字过滤，使用正则检查title和description中的关键字，含有关键字的推送不会发出，不区分大小写").default([]),
    keywordBlock: import_koishi.Schema.array(import_koishi.Schema.string()).role("table").description("关键字屏蔽，内容中的正则关键字会被删除，不区分大小写").default([]),
    blockString: import_koishi.Schema.string().description("关键字屏蔽替换内容").default("*"),
    censor: import_koishi.Schema.boolean().description("消息审查，需要censor服务").default(false)
  }).description("消息处理"),
  // customUrlEnable:Schema.boolean().description('开发中：允许使用自定义规则对网页进行提取，用于对非RSS链接抓取').default(false).experimental(),
  debug: import_koishi.Schema.union(debugLevel).default(debugLevel[0])
});
function apply(ctx, config) {
  ctx.model.extend(
    "rsssc",
    {
      id: "integer",
      url: "text",
      platform: "string",
      guildId: "string",
      author: "string",
      rssId: "integer",
      arg: "json",
      lastContent: "json",
      title: "string",
      followers: "list",
      lastPubDate: "timestamp"
    },
    {
      autoInc: true
    }
  );
  const getDefaultTemplate = /* @__PURE__ */ __name((bodyWidth, bodyPadding, bodyFontSize) => `<body><h3>{{title}}</h3><h5>{{pubDate}}</h5><br><div>{{description}}<div></body>
    <style>*{${bodyFontSize ? `font-size: ${bodyFontSize}px !important;` : ""}body{width:${bodyWidth || config.template.bodyWidth}px;padding:${bodyPadding || config.template.bodyPadding}px;}}</style>`, "getDefaultTemplate");
  const getDescriptionTemplate = /* @__PURE__ */ __name((bodyWidth, bodyPadding, bodyFontSize) => `<body>{{description}}</body>
    <style>*{${bodyFontSize ? `font-size: ${bodyFontSize}px !important;` : ""}body{width:${bodyWidth || config.template.bodyWidth}px;padding:${bodyPadding || config.template.bodyPadding}px;}}</style>`, "getDescriptionTemplate");
  let interval;
  const debug = /* @__PURE__ */ __name((message, name2 = "", type = "details") => {
    const typeLevel = debugLevel.findIndex((i) => i == type);
    if (typeLevel < 1)
      return;
    if (typeLevel > debugLevel.findIndex((i) => i == config.debug))
      return;
    if (name2)
      logger.info(`${type}:<<${name2}>>`);
    logger.info(message);
  }, "debug");
  const getImageUrl = /* @__PURE__ */ __name(async (url, arg, useBase64Mode = false) => {
    debug("imgUrl:" + url, "", "details");
    if (!url)
      return "";
    let res;
    res = await $http(url, arg, { responseType: "arraybuffer" });
    debug(res.data, "img response", "details");
    let prefixList = ["png", "jpeg", "webp"];
    let prefix = res.headers["content-type"] || "image/" + (prefixList.find((i) => new RegExp(i).test(url)) || "jpeg");
    let base64Prefix = `data:${prefix};base64,`;
    let base64Data = base64Prefix + Buffer.from(res.data, "binary").toString("base64");
    if (config.basic.imageMode == "base64" || useBase64Mode) {
      return base64Data;
    } else if (config.basic.imageMode == "File") {
      let fileUrl = await writeCacheFile(base64Data);
      return fileUrl;
    }
  }, "getImageUrl");
  const getVideoUrl = /* @__PURE__ */ __name(async (url, arg, useBase64Mode = false, dom) => {
    let src = dom.attribs.src || dom.children["0"].attribs.src;
    let res;
    if (config.basic.videoMode == "href") {
      return src;
    } else {
      res = await $http(src, { ...arg, timeout: 0 }, { responseType: "arraybuffer" });
      let prefix = res.headers["content-type"];
      let base64Prefix = `data:${prefix};base64,`;
      let base64Data = base64Prefix + Buffer.from(res.data, "binary").toString("base64");
      if (config.basic.videoMode == "base64") {
        return base64Data;
      } else if (config.basic.videoMode == "File") {
        let fileUrl = await writeCacheFile(base64Data);
        return fileUrl;
      }
    }
  }, "getVideoUrl");
  const puppeteerToFile = /* @__PURE__ */ __name(async (puppeteer) => {
    let base64 = /(?<=src=").+?(?=")/.exec(puppeteer)[0];
    const buffer = Buffer.from(base64.substring(base64.indexOf(",") + 1), "base64");
    const MB = buffer.length / 1e6;
    debug("MB: " + MB, "file size", "details");
    return `<file src="${await writeCacheFile(base64)}"/>`;
  }, "puppeteerToFile");
  const quickList = [
    { prefix: "rss", name: "rsshub通用订阅", detail: "rsshub通用快速订阅\nhttps://docs.rsshub.app/zh/routes/new-media#%E6%97%A9%E6%8A%A5%E7%BD%91", example: "rss:qqorw", replace: "{{rsshub}}/{{route}}" },
    { prefix: "tg", name: "rsshub电报频道订阅", detail: "输入电报频道信息中的链接地址最后部分，需要该频道启用网页预览\nhttps://docs.rsshub.app/zh/routes/social-media#telegram", example: "tg:woshadiao", replace: "{{rsshub}}/telegram/channel/{{route}}" },
    { prefix: "mp-tag", name: "rsshub微信公众平台话题TAG", detail: "一些公众号（如看理想）会在微信文章里添加 Tag，浏览器打开Tag文章列表，如 https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361，输入其中biz和album_id\nhttps://docs.rsshub.app/zh/routes/new-media#%E5%85%AC%E4%BC%97%E5%8F%B7%E6%96%87%E7%AB%A0%E8%AF%9D%E9%A2%98-tag", example: "mp-tag:MzA3MDM3NjE5NQ==/1375870284640911361", replace: "{{rsshub}}/wechat/mp/msgalbum/{{route}}" },
    { prefix: "gh", name: "rsshub-github订阅", detail: "Repo Issue: gh:issue/[:user]/[:repo]/[:state?(open|closed|all)]/[:labels?(open|bug|...)]\nUser Activities: gh:activity/[:user]\nhttps://docs.rsshub.app/zh/routes/popular#github", example: "gh:issue/koishijs/koishi/open", replace: "{{rsshub}}/github/{{route}}" },
    { prefix: "github", name: "原生github订阅(含releases,commits,activity)", detail: "Repo Releases: github::[:owner]/[:repo]/releases\nRepo commits: github:[:owner]/[:repo]/commits\nUser activities:github:[:user]\n", example: "github:facebook/react/releases", replace: "https://github.com/{{route}}.atom" },
    // {prefix:"weibo",name:"微博博主",detail:"输入博主用户id\n公开订阅源对微博支持欠佳，建议自己部署并配置Cookie",example:"weibo:1195230310",replace:"{{rsshub}}/weibo/user/{{route}}"},
    { prefix: "koishi", name: "koishi论坛相关", detail: "最新话题: koishi:latest\n类别: koishi:c/plugin-publish (插件发布)\n话题 koishi:u/shigma/activity\n基于discourse论坛的feed订阅，更多见: https://meta.discourse.org/t/finding-discourse-rss-feeds/264134 或可尝试在网址后面加上 .rss ", example: "koishi:latest", replace: "https://forum.koishi.xyz/{{route}}.rss" }
  ];
  const parseQuickUrl = /* @__PURE__ */ __name((url) => {
    let correntQuickObj = quickList.find((i) => new RegExp(`^${i.prefix}:`).test(url));
    if (!correntQuickObj)
      return url;
    let rsshub = config.msg.rssHubUrl;
    let route = url.match(new RegExp(`(?<=^${correntQuickObj.prefix}:).*`))[0];
    const parseContent = /* @__PURE__ */ __name((template, item) => template.replace(/{{(.+?)}}/g, (i) => i.match(/^{{(.*)}}$/)[1].split("|").reduce((t, v) => t || v.match(/^'(.*)'$/)?.[1] || v.split(".").reduce((t2, v2) => new RegExp("Date").test(v2) ? new Date(t2?.[v2]).toLocaleString("zh-CN") : t2?.[v2] || "", item), "")), "parseContent");
    let rUrl = parseContent(correntQuickObj.replace, { rsshub, route });
    return rUrl;
  }, "parseQuickUrl");
  const getCacheDir = /* @__PURE__ */ __name(() => {
    let dir = config.basic.cacheDir ? path.resolve("./", config.basic.cacheDir || "") : `${__dirname}/cache`;
    let mkdir = /* @__PURE__ */ __name((path2, deep = 2) => {
      let dir2 = path2.split("\\").splice(0, deep).join("\\");
      let dirDeep = path2.split("\\").length;
      if (!fs.existsSync(dir2)) {
        fs.mkdirSync(dir2);
      }
      return dirDeep > deep && mkdir(path2, deep + 1);
    }, "mkdir");
    if (!fs.existsSync(dir)) {
      mkdir(dir);
    }
    return dir;
  }, "getCacheDir");
  const writeCacheFile = /* @__PURE__ */ __name(async (fileUrl) => {
    const cacheDir = getCacheDir();
    debug(cacheDir, "cacheDir", "details");
    let fileList = fs.readdirSync(cacheDir);
    let suffix = /(?<=^data:.+?\/).+?(?=;base64)/.exec(fileUrl)[0];
    let fileName = `${parseInt((Math.random() * 1e7).toString()).toString()}.${suffix}`;
    while (fileList.find((i) => i == fileName)) {
      fileName = `${parseInt((Math.random() * 1e7).toString()).toString()}.${suffix}`;
    }
    let base64Data = fileUrl.replace(/^data:.+?;base64,/, "");
    let path2 = `${cacheDir}/${fileName}`;
    fs.writeFileSync(path2, base64Data, "base64");
    if (config.basic.replaceDir) {
      return `file:///${config.basic.replaceDir}/${fileName}`;
    } else {
      return (0, import_url.pathToFileURL)(path2).href;
    }
  }, "writeCacheFile");
  const delCache = /* @__PURE__ */ __name(async () => {
    const cacheDir = getCacheDir();
    const files = fs.readdirSync(cacheDir);
    await Promise.all(
      files.filter((file) => !!path.extname(file)).map((file) => {
        const filePath = path.join(cacheDir, file);
        return fs.promises.unlink(filePath);
      })
    );
  }, "delCache");
  const sleep = /* @__PURE__ */ __name((delay = 1e3) => new Promise((resolve2) => setTimeout(resolve2, delay)), "sleep");
  class RequestManager {
    static {
      __name(this, "RequestManager");
    }
    queue = [];
    running = 0;
    maxConcurrent;
    tokenBucket;
    lastRefill;
    refillRate;
    // 令牌产生速率(个/秒)
    bucketSize;
    constructor(maxConcurrent = 3, refillRate = 2, bucketSize = 10) {
      this.maxConcurrent = maxConcurrent;
      this.tokenBucket = bucketSize;
      this.bucketSize = bucketSize;
      this.refillRate = refillRate;
      this.lastRefill = Date.now();
    }
    refillTokens() {
      const now = Date.now();
      const timePassed = now - this.lastRefill;
      const newTokens = Math.floor(timePassed / 1e3 * this.refillRate);
      this.tokenBucket = Math.min(this.bucketSize, this.tokenBucket + newTokens);
      this.lastRefill = now;
    }
    async processQueue() {
      if (this.running >= this.maxConcurrent || this.queue.length === 0)
        return;
      this.refillTokens();
      if (this.tokenBucket <= 0) {
        setTimeout(() => this.processQueue(), 1e3);
        return;
      }
      const task = this.queue.shift();
      if (!task)
        return;
      this.running++;
      this.tokenBucket--;
      try {
        await task();
      } catch (error) {
        debug(error, "Request failed", "error");
      } finally {
        this.running--;
        this.processQueue();
      }
    }
    async enqueue(task) {
      return new Promise((resolve2, reject) => {
        this.queue.push(async () => {
          try {
            const result = await task();
            resolve2(result);
          } catch (error) {
            reject(error);
          }
        });
        this.processQueue();
      });
    }
  }
  const requestManager = new RequestManager(3, 2, 10);
  const $http = /* @__PURE__ */ __name(async (url, arg, config2 = {}) => {
    const makeRequest = /* @__PURE__ */ __name(async () => {
      let requestConfig = { timeout: (arg.timeout || 0) * 1e3 };
      let proxy = {};
      if (arg?.proxyAgent?.enabled) {
        proxy["proxy"] = {
          "protocol": arg.proxyAgent.protocol,
          "host": arg.proxyAgent.host,
          "port": arg.proxyAgent.port
        };
        if (arg?.proxyAgent?.auth?.enabled) {
          proxy["proxy"]["auth"] = {
            username: arg.proxyAgent.auth.username,
            password: arg.proxyAgent.auth.password
          };
        }
      }
      if (arg.userAgent) {
        requestConfig["header"] = { "User-Agent": arg.userAgent };
      }
      debug(`${url} : ${JSON.stringify({ ...requestConfig, ...config2, ...proxy })}`, "request info", "details");
      let retries = 3;
      while (retries > 0) {
        try {
          return await import_axios.default.get(url, {
            ...requestConfig,
            ...config2,
            ...retries % 2 ? proxy : {}
          });
        } catch (error) {
          retries--;
          if (retries <= 0) {
            throw error;
          }
          await sleep(1e3);
        }
      }
      throw new Error("Max retries reached");
    }, "makeRequest");
    return requestManager.enqueue(makeRequest);
  }, "$http");
  const renderHtml2Image = /* @__PURE__ */ __name(async (htmlContent) => {
    let page = await ctx.puppeteer.page();
    try {
      debug(htmlContent, "htmlContent", "details");
      await page.setContent(htmlContent);
      if (!config.basic.autoSplitImage) {
        const image = await page.screenshot({ type: "png" });
        return import_koishi.h.image(image, "image/png");
      }
      let [height, width, x, y] = await page.evaluate(() => [
        document.body.offsetHeight,
        document.body.offsetWidth,
        parseInt(document.defaultView.getComputedStyle(document.body).marginLeft) || 0,
        parseInt(document.defaultView.getComputedStyle(document.body).marginTop) || 0
      ]);
      let size = 1e4;
      debug([height, width, x, y], "pptr img size", "details");
      const split = Math.ceil(height / size);
      if (!split) {
        const image = await page.screenshot({ type: "png", clip: { x, y, width, height } });
        return import_koishi.h.image(image, "image/png");
      }
      debug({ height, width, split }, "split img", "details");
      const reduceY = /* @__PURE__ */ __name((index) => Math.floor(height / split * index), "reduceY");
      const reduceHeight = /* @__PURE__ */ __name((index) => Math.floor(height / split), "reduceHeight");
      let imgData = await Promise.all(
        Array.from(
          { length: split },
          async (v, i) => await page.screenshot({
            type: "png",
            clip: {
              x,
              y: reduceY(i) + y,
              width,
              height: reduceHeight(i)
            }
          })
        )
      );
      return imgData.map((i) => import_koishi.h.image(i, "image/png")).join("");
    } finally {
      await page.close();
    }
  }, "renderHtml2Image");
  const getRssData = /* @__PURE__ */ __name(async (url, config2) => {
    try {
      const res = await $http(url, config2);
      let rssData = res.data;
      const rssJson = x2js.xml2js(rssData);
      let parseContent = /* @__PURE__ */ __name((content, attr = void 0) => {
        debug(content, "parseContent");
        if (!content)
          return void 0;
        if (typeof content == "string")
          return content;
        if (attr && content?.[attr])
          return parseContent(content?.[attr]);
        if (content["__cdata"])
          return content["__cdata"]?.join?.("") || content["__cdata"];
        if (content["__text"])
          return content["__text"]?.join?.("") || content["__text"];
        if (Object.prototype.toString.call(content) === "[object Array]") {
          return parseContent(content[0], attr);
        } else if (Object.prototype.toString.call(content) === "[object Object]") {
          return Object.values(content).reduce((t, v) => {
            if (v && (typeof v == "string" || v?.join)) {
              let text = v?.join("") || v;
              return text.length > t.length ? text : t;
            } else {
              return t;
            }
          }, "");
        } else {
          return content;
        }
      }, "parseContent");
      if (rssJson.rss) {
        rssJson.rss.channel.item = [rssJson.rss.channel.item].flat(Infinity);
        const rssItemList = rssJson.rss.channel.item.map((i) => ({ ...i, guid: parseContent(i?.guid), rss: rssJson.rss }));
        return rssItemList;
      } else if (rssJson.feed) {
        let rss = { channel: {} };
        let item = rssJson.feed.entry.map((i) => ({
          ...i,
          title: parseContent(i.title),
          description: parseContent(i.content),
          link: parseContent(i.link, "_href"),
          guid: parseContent(i.id),
          pubDate: parseContent(i.updated),
          author: parseContent(i.author, "name")
          // category:i,
          // comments:i,
          // enclosure:i,
          // source:i,
        }));
        rss.channel = {
          title: rssJson.feed.title,
          link: rssJson.feed.link?.[0]?.href || rssJson.feed.link?.href,
          description: rssJson.feed.summary,
          generator: rssJson.feed.generator,
          // webMaster:undefined,
          language: rssJson.feed["@xml:lang"],
          item
        };
        item = item.map((i) => ({ rss, ...i }));
        debug(item, "atom item", "details");
        debug(item[0], "atom item2", "details");
        return item;
      } else {
        debug(rssJson, "未知rss格式，请提交issue", "error");
      }
    } catch (error) {
      debug(`Failed to fetch RSS from ${url}`, "", "error");
      throw error;
    }
  }, "getRssData");
  const parseRssItem = /* @__PURE__ */ __name(async (item, arg, authorId) => {
    debug(arg, "rss arg", "details");
    let template = arg.template;
    let msg = "";
    let html;
    let videoList = [];
    item.description = item.description?.join?.("") || item.description;
    arg.block?.forEach((blockWord) => {
      item.description = item.description.replace(new RegExp(blockWord, "gim"), (i) => Array(i.length).fill(config.msg.blockString).join(""));
      item.title = item.title.replace(new RegExp(blockWord, "gim"), (i) => Array(i.length).fill(config.msg.blockString).join(""));
    });
    debug(template, "template");
    const parseContent = /* @__PURE__ */ __name((template2, item2) => template2.replace(/{{(.+?)}}/g, (i) => i.match(/^{{(.*)}}$/)[1].split("|").reduce((t, v) => t || v.match(/^'(.*)'$/)?.[1] || v.split(".").reduce((t2, v2) => new RegExp("Date").test(v2) ? new Date(t2?.[v2]).toLocaleString("zh-CN") : t2?.[v2] || "", item2), "")), "parseContent");
    if (config.basic.videoMode === "filter") {
      html = cheerio.load(item.description);
      if (html("video").length > 0)
        return "";
    }
    html = cheerio.load(item.description);
    if (template == "auto") {
      let stringLength = html.text().length;
      template = stringLength < 300 ? "content" : "custom";
    }
    if (template == "custom") {
      item.description = parseContent(config.template.custom, { ...item, arg });
      debug(item.description, "description");
      html = cheerio.load(item.description);
      if (arg?.proxyAgent?.enabled) {
        await Promise.all(html("img").map(async (v, i) => i.attribs.src = await getImageUrl(i.attribs.src, arg, true)));
      }
      html("img").attr("style", "object-fit:scale-down;max-width:100%;");
      if (config.basic.imageMode == "base64") {
        msg = (await renderHtml2Image(html.html())).toString();
      } else if (config.basic.imageMode == "File") {
        msg = await ctx.puppeteer.render(html.html());
        msg = await puppeteerToFile(msg);
      }
      msg = parseContent(config.template.customRemark, { ...item, arg, description: msg });
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
    } else if (template == "content") {
      html = cheerio.load(item.description);
      let imgList = [];
      html("img").map((key, i) => imgList.push(i.attribs.src));
      imgList = [...new Set(imgList)];
      let imgBufferList = Object.assign({}, ...await Promise.all(imgList.map(async (src) => ({ [src]: await getImageUrl(src, arg) }))));
      html("img").replaceWith((key, Dom) => `<p>$img{{${imgList[key]}}}</p>`);
      msg = html.text();
      item.description = msg.replace(/\$img\{\{(.*?)\}\}/g, (match) => {
        let src = match.match(/\$img\{\{(.*?)\}\}/)[1];
        return `<img src="${imgBufferList[src]}"/>`;
      });
      msg = parseContent(config.template.content, { ...item, arg });
      logger.info(msg);
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("img", { src: poster })).join("");
    } else if (template == "only text") {
      html = cheerio.load(item.description);
      msg = html.text();
    } else if (template == "only media") {
      html = cheerio.load(item.description);
      let imgList = [];
      html("img").map((key, i) => imgList.push(i.attribs.src));
      imgList = await Promise.all([...new Set(imgList)].map(async (src) => await getImageUrl(src, arg)));
      msg = imgList.map((img) => `<img src="${img}"/>`).join("");
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
    } else if (template == "only image") {
      html = cheerio.load(item.description);
      let imgList = [];
      html("img").map((key, i) => imgList.push(i.attribs.src));
      imgList = await Promise.all([...new Set(imgList)].map(async (src) => await getImageUrl(src, arg)));
      msg = imgList.map((img) => `<img src="${img}"/>`).join("");
    } else if (template == "only video") {
      html = cheerio.load(item.description);
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
    } else if (template == "proto") {
      msg = item.description;
    } else if (template == "default") {
      item.description = parseContent(getDefaultTemplate(config.template.bodyWidth, config.template.bodyPadding, config.template.bodyFontSize), { ...item, arg });
      debug(item.description, "description");
      html = cheerio.load(item.description);
      if (arg?.proxyAgent?.enabled) {
        await Promise.all(html("img").map(async (v, i) => i.attribs.src = await getImageUrl(i.attribs.src, arg, true)));
      }
      html("img").attr("style", "object-fit:scale-down;max-width:100%;");
      if (config.basic.imageMode == "base64") {
        msg = (await renderHtml2Image(html.html())).toString();
      } else if (config.basic.imageMode == "File") {
        msg = await ctx.puppeteer.render(html.html());
        msg = await puppeteerToFile(msg);
      }
      if (config.basic.imageMode == "File")
        msg = await puppeteerToFile(msg);
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
    } else if (template == "only description") {
      item.description = parseContent(getDescriptionTemplate(config.template.bodyWidth, config.template.bodyPadding, config.template.bodyFontSize), { ...item, arg });
      html = cheerio.load(item.description);
      if (arg?.proxyAgent?.enabled) {
        await Promise.all(html("img").map(async (v, i) => i.attribs.src = await getImageUrl(i.attribs.src, arg, true)));
      }
      html("img").attr("style", "object-fit:scale-down;max-width:100%;");
      if (config.basic.imageMode == "base64") {
        msg = (await renderHtml2Image(html.html())).toString();
      } else if (config.basic.imageMode == "File") {
        msg = await ctx.puppeteer.render(html.html());
        msg = await puppeteerToFile(msg);
      }
      await Promise.all(html("video").map(async (v, i) => videoList.push([await getVideoUrl(i.attribs.src, arg, true, i), i.attribs.poster && config.basic.usePoster ? await getImageUrl(i.attribs.poster, arg, true) : ""])));
      msg += videoList.map(([src, poster]) => (0, import_koishi.h)("video", { src, poster })).join("");
    } else if (template == "link") {
      html = cheerio.load(item.description);
      let src = html("a")[0].attribs.href;
      debug(src, "link src", "info");
      let html2 = cheerio.load((await $http(src, arg)).data);
      if (arg?.proxyAgent?.enabled) {
        await Promise.all(html2("img").map(async (v, i) => i.attribs.src = await getImageUrl(i.attribs.src, arg, true)));
      }
      html2("img").attr("style", "object-fit:scale-down;max-width:100%;");
      html2("body").attr("style", `width:${config.template.bodyWidth}px;padding:${config.template.bodyPadding}px;`);
      if (config.basic.imageMode == "base64") {
        msg = (await renderHtml2Image(html2.xml())).toString();
      } else if (config.basic.imageMode == "File") {
        msg = await ctx.puppeteer.render(html2.xml());
        msg = await puppeteerToFile(msg);
      }
    }
    if (config.msg.censor) {
      msg = `<censor>${msg}</censor>`;
    }
    debug(msg, "parse:msg", "info");
    return msg;
  }, "parseRssItem");
  const findRssItem = /* @__PURE__ */ __name((rssList, keyword) => {
    let index = (rssList.findIndex((i) => i.rssId === +keyword) + 1 || rssList.findIndex((i) => i.url == keyword) + 1 || rssList.findIndex((i) => i.url.indexOf(keyword) + 1) + 1 || rssList.findIndex((i) => i.title.indexOf(keyword) + 1) + 1) - 1;
    return rssList[index];
  }, "findRssItem");
  const getLastContent = /* @__PURE__ */ __name((item) => {
    let arr = ["title", "description", "link", "guid"];
    let obj = Object.assign({}, ...arr.map((i) => (0, import_koishi.clone)(item?.[i] ? { [i]: item[i] } : {})));
    return { ...obj, description: String(obj?.description).replaceAll(/\s/g, "") };
  }, "getLastContent");
  const feeder = /* @__PURE__ */ __name(async () => {
    debug("feeder");
    const rssList = await ctx.database.get("rsssc", {});
    debug(rssList, "rssList", "info");
    for (const rssItem of rssList) {
      try {
        let arg = mixinArg(rssItem.arg || {});
        debug(arg, "arg", "details");
        debug(rssItem.arg, "originalArg", "details");
        let originalArg = (0, import_koishi.clone)(rssItem.arg || {});
        if (rssItem.arg.interval) {
          if (arg.nextUpdataTime > +/* @__PURE__ */ new Date())
            continue;
          originalArg.nextUpdataTime = arg.nextUpdataTime + arg.interval * Math.ceil((+/* @__PURE__ */ new Date() - arg.nextUpdataTime) / arg.interval);
        }
        try {
          let rssItemList = (await Promise.all(rssItem.url.split("|").map((i) => parseQuickUrl(i)).map(async (url) => await getRssData(url, arg)))).flat(1);
          let itemArray = rssItemList.sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate)).filter((item) => !arg.filter?.some((keyword) => {
            let isFilter = new RegExp(keyword, "im").test(item.title) || new RegExp(keyword, "im").test(item.description);
            if (isFilter) {
              debug(`filter:${keyword}`, "", "info");
              debug(item, "filter rss item", "info");
              return true;
            } else {
              return false;
            }
          }));
          let lastContent = { itemArray: config.basic.resendUpdataContent === "all" ? itemArray.map(getLastContent) : config.basic.resendUpdataContent === "latest" ? [getLastContent(itemArray[0])] : [] };
          let lastPubDate = new Date(itemArray[0].pubDate) || /* @__PURE__ */ new Date(0);
          if (arg.reverse) {
            itemArray = itemArray.reverse();
          }
          debug(itemArray[0], "first rss response", "details");
          let messageList, rssItemArray;
          if (rssItem.arg.forceLength) {
            debug(`forceLength:${rssItem.arg.forceLength}`, "", "details");
            rssItemArray = itemArray.filter((v, i) => i < arg.forceLength);
            debug(rssItemArray.map((i) => i.title), "", "info");
            messageList = await Promise.all(itemArray.filter((v, i) => i < arg.forceLength).map(async (i) => await parseRssItem(i, { ...rssItem, ...arg }, rssItem.author)));
          } else {
            rssItemArray = itemArray.filter((v, i) => +new Date(v.pubDate) > rssItem.lastPubDate || rssItem.lastContent?.itemArray?.some((oldRssItem) => {
              if (config.basic.resendUpdataContent === "disable")
                return false;
              let newItem = getLastContent(v);
              let isSame = newItem.guid ? newItem.guid === oldRssItem.guid : newItem.link === oldRssItem.link && newItem.title === oldRssItem.title;
              if (!isSame)
                return false;
              debug(JSON.stringify(oldRssItem.description), "oldRssItem", "details");
              debug(JSON.stringify(newItem.description), "newItem", "details");
              return JSON.stringify(oldRssItem.description) !== JSON.stringify(newItem.description);
            })).filter((v, i) => !arg.maxRssItem || i < arg.maxRssItem);
            if (!rssItemArray.length)
              continue;
            debug(`${JSON.stringify(rssItem)}:共${rssItemArray.length}条新信息`, "", "info");
            debug(rssItemArray.map((i) => i.title), "", "info");
            messageList = await Promise.all(rssItemArray.reverse().map(async (i) => await parseRssItem(i, { ...rssItem, ...arg }, rssItem.author)));
          }
          let message;
          if (!messageList.join(""))
            return;
          if (arg.sendMode === "each") { // 根据sendMode来决定推送方式
            for (const msg of messageList) {
              message = msg;
              if (rssItem.followers.length) {
                message += `<message>${rssItem.followers.map((followId) => `<at ${followId == "all" ? "type" : "id"}='${followId}'/>`)}</message>`;
              }
              const broadcast = await ctx.broadcast([`${rssItem.platform}:${rssItem.guildId}`], message);
              if (!broadcast[0])
                throw new Error("发送失败");
              debug(`更新成功:${rssItem.title}`, "", "info");
            }
          } else {
            if (arg.merge === true) {
              message = `<message forward><author id="${rssItem.author}"/>${messageList.join("")}</message>`;
            } else if (arg.merge === false) {
              message = messageList.join("");
            } else if (config.basic.margeVideo && messageList.some((msg) => /<video.*>/.test(msg))) {
              message = `<message forward><author id="${rssItem.author}"/>${messageList.map((i) => `<message>${i}</message>`).join("")}</message>`;
            } else if (config.basic.merge == "一直合并") {
              message = `<message forward><author id="${rssItem.author}"/>${messageList.map((i) => `<message>${i}</message>`).join("")}</message>`;
            } else if (config.basic.merge == "不合并") {
              message = messageList.join("");
            } else if (config.basic.merge == "有多条更新时合并") {
              message = messageList.length > 1 ? `<message forward><author id="${rssItem.author}"/>${messageList.map((i) => `<message>${i}</message>`).join("")}</message>` : messageList.join("");
            }
            if (rssItem.followers.length) {
              message += `<message>${rssItem.followers.map((followId) => `<at ${followId == "all" ? "type" : "id"}='${followId}'/>`)}</message>`;
            }
            const broadcast = await ctx.broadcast([`${rssItem.platform}:${rssItem.guildId}`], message);
            if (!broadcast[0])
              throw new Error("发送失败");
            await ctx.database.set("rsssc", { id: rssItem.id }, { lastPubDate, arg: originalArg, lastContent });
            debug(`更新成功:${rssItem.title}`, "", "info");
          }
        } catch (error) {
          debug(error, `更新失败:${JSON.stringify({ ...rssItem, lastContent: "..." })}`, "error");
        }
      } catch (error) {
        debug(error, "", "error");
      }
    }
  }, "feeder");
  const formatArg = /* @__PURE__ */ __name((options) => {
    let { arg, template, daily } = options;
    let json = Object.assign({}, ...arg?.split(",")?.map((i) => ({ [i.split(":")[0]]: i.split(":")[1] })) || []);
    let key = ["forceLength", "reverse", "timeout", "interval", "merge", "maxRssItem", "firstLoad", "bodyWidth", "bodyPadding", "proxyAgent", "auth"];
    let booleanKey = ["firstLoad", "reverse", "merge"];
    let numberKey = ["forceLength", "timeout", "interval", "maxRssItem", "bodyWidth", "bodyPadding"];
    let falseContent = ["false", "null", ""];
    json = Object.assign({}, ...Object.keys(json).filter((i) => key.some((key2) => key2 == i)).map((key2) => ({ [key2]: booleanKey.some((bkey) => bkey == key2) ? falseContent.some((c) => c == json[key2]) : numberKey.some((nkey) => nkey == key2) ? +json[key2] : json[key2] })));
    if (template && templateList.find((i) => new RegExp(template).test(i))) {
      json["template"] = templateList.find((i) => new RegExp(template).test(i));
    }
    if (daily) {
      json["interval"] = 1440;
      let [hour = 8, minutes = 0] = daily.split("/")[0].split(":").map((i) => parseInt(i));
      minutes = minutes > 60 ? 0 : minutes < 0 ? 0 : minutes;
      let date = /* @__PURE__ */ new Date();
      date.setHours(hour, minutes, 0, 0);
      if (+/* @__PURE__ */ new Date() > +date) {
        date.setDate(date.getDate() + 1);
      }
      json.nextUpdataTime = +date;
      let forceLength = parseInt(options.daily.split("/")?.[1]);
      if (forceLength) {
        json.forceLength = forceLength;
      }
    }
    if (json.interval) {
      json.interval = json.interval ? parseInt(json.interval) * 1e3 : 0;
    }
    if (json.forceLength) {
      json.forceLength = parseInt(json.forceLength);
    }
    if (json.filter) {
      json.filter = json.filter.split("/");
    }
    if (json.block) {
      json.block = json.block.split("/");
    }
    if (json.proxyAgent) {
      if (json.proxyAgent == "false" || json.proxyAgent == "none" || json.proxyAgent === "") {
        json.proxyAgent = { enabled: false };
      } else {
        let protocol = json.proxyAgent.match(/^(http|https|socks5)(?=\/\/)/);
        let host = json.proxyAgent.match(/(?<=:\/\/)(.+?)(?=\/)/);
        let port = +json.proxyAgent.match(/(?<=\/)(\d{1,5})$/);
        let proxyAgent = { enabled: true, protocol, host, port };
        json.proxyAgent = proxyAgent;
        if (json.auth) {
          let username = json.auth.split("/")[0];
          let password = json.auth.split("/")[1];
          let auth = { username, password };
          json.proxyAgent.auth = auth;
        }
      }
    }
    debug(json, "formatArg", "details");
    return json;
  }, "formatArg");
  const mixinArg = /* @__PURE__ */ __name((arg) => ({
    ...Object.assign({}, ...Object.entries(config).map(([key, value]) => typeof value === "object" ? value : { [key]: value })),
    ...arg,
    filter: [...config.msg.keywordFilter, ...arg?.filter || []],
    block: [...config.msg.keywordBlock, ...arg?.block || []],
    template: arg.template ?? config.basic.defaultTemplate,
    proxyAgent: arg?.proxyAgent ? arg.proxyAgent?.enabled ? arg.proxyAgent?.host ? arg.proxyAgent : { ...config.net.proxyAgent, auth: config.net.proxyAgent.auth.enabled ? config.net.proxyAgent.auth : {} } : { enabled: false } : config.net.proxyAgent.enabled ? { ...config.net.proxyAgent, auth: config.net.proxyAgent.auth.enabled ? config.net.proxyAgent.auth : {} } : {}
  }), "mixinArg");
  ctx.on("ready", async () => {
    feeder();
    interval = setInterval(async () => {
      if (config.basic.imageMode == "File") {
        await delCache();
      }
      await feeder();
    }, config.basic.refresh * 1e3);
  });
  ctx.on("dispose", async () => {
    clearInterval(interval);
    if (config.basic.imageMode == "File")
      delCache();
  });
  ctx.guild().command("rsssc <url:text>", "*订阅 RSS 链接*").alias("rsc").usage("https://github.com/borraken/koishi-plugin-rss-sc").option("list", "-l [content] 查看订阅列表(详情)").option("remove", "-r <content> [订阅id|关键字] *删除订阅*").option("removeAll", "*删除全部订阅*").option("follow", "-f <content> [订阅id|关键字] 关注订阅，在该订阅更新时提醒你").option("followAll", "<content> [订阅id|关键字] **在该订阅更新时提醒所有人**").option("target", "<content> [群组id] **跨群订阅**").option("arg", "-a <content> 自定义配置").option("template", "-i <content> 消息模板[content(文字模板)|default(图片模板)],更多见readme").option("title", "-t <content> 自定义命名").option("pull", "-p <content> [订阅id|关键字]拉取订阅id最后更新").option("force", "强行写入").option("daily", "-d <content>").option("test", "-T 测试").option("quick", "-q [content] 查询快速订阅列表").option("sendMode", "-s <content> 推送模式[merge(合并)|each(逐条)],默认为merge").example("rsso https://hub.slarker.me/qqorw").action(async ({ session, options }, url) => {
    debug(options, "options", "info");
    const { id: guildId } = session.event.guild;
    const { platform } = session.event;
    const { id: author } = session.event.user;
    const { authority } = session.user;
    debug(`${platform}:${author}:${guildId}`, "", "info");
    if (options?.quick === "") {
      return "输入 rsssc -q [id] 查询详情\n" + quickList.map((v, i) => `${i + 1}.${v.name}`).join("\n");
    }
    if (options?.quick) {
      let correntQuickObj = quickList[parseInt(options?.quick) - 1];
      return `${correntQuickObj.name}
${correntQuickObj.detail}
例:rsso -T ${correntQuickObj.example}
(${parseQuickUrl(correntQuickObj.example)})`;
    }
    if (platform.indexOf("sandbox") + 1 && !options.test && url) {
      session.send("沙盒中无法推送更新，但RSS依然会被订阅，建议使用 -T 选项进行测试");
    }
    const rssList = await ctx.database.get("rsssc", { platform, guildId });
    if (options?.list === "") {
      debug(rssList, "rssList", "info");
      if (!rssList.length)
        return "未订阅任何链接。";
      return "使用'rsssc -l [id]'以查询详情 \nid:标题(最后更新)\n" + rssList.map((i) => `${i.rssId}:${i.title || i.url} (${new Date(i.lastPubDate).toLocaleString("zh-CN")})`).join("\n");
    }
    if (options?.list) {
      let rssObj = findRssItem(rssList, options.list);
      if (!rssObj) {
        return `未找到${options.list}`;
      }
      if (!rssObj)
        return '未找到订阅。请输入"rsso -l"查询列表或"rsso -l [订阅id]"查询订阅详情';
      const showArgNameList = ["rssId", "title", "url", "template", "platform", "guildId", "author", "merge", "timeout", "interval", "forceLength", "nextUpdataTime", "maxRssItem", "lastPubDate"];
      const _rssArg = Object.assign(rssObj.arg, rssObj);
      return showArgNameList.map((argName) => {
        if (!_rssArg?.[argName])
          return "";
        let text = "";
        if (argName === "url") {
          text = _rssArg?.[argName].split("|").map((i) => ` ${parseQuickUrl(i)} ${i == parseQuickUrl(i) ? "" : `(${i})`}`).join(" | ");
        } else if (argName.includes("Date") || argName.includes("Time")) {
          text = new Date(_rssArg?.[argName]).toLocaleString("zh-CN");
        } else {
          text = typeof _rssArg?.[argName] === "object" ? JSON.stringify(_rssArg?.[argName]) : _rssArg?.[argName];
        }
        return `${argName}:${text}`;
      }).filter(Boolean).join("\n");
    }
    if (options.remove) {
      if (authority < config.basic.authority) {
        return `权限不足，请联系管理员提权
平台名:${platform}
帐号:${author}
当前权限等级:${authority}`;
      }
      debug(`remove:${options.remove}`, "", "info");
      let removeItem = findRssItem(rssList, options.remove);
      if (!removeItem) {
        return `未找到${options.remove}`;
      }
      debug(`remove:${removeItem}`, "", "info");
      ctx.database.remove("rsssc", { id: removeItem.id });
      return `已取消订阅：${removeItem.title}`;
    }
    if (options?.removeAll != void 0) {
      if (authority < config.basic.authority) {
        return `权限不足，请联系管理员提权
平台名:${platform}
帐号:${author}
当前权限等级:${authority}
需求权限等级:${config.basic.authority}`;
      }
      debug(rssList, "", "info");
      let rssLength = rssList.length;
      await ctx.database.remove("rsssc", { platform, guildId });
      return `已删除${rssLength}条`;
    }
    if (options.follow) {
      debug(`follow:${options.follow}`, "", "info");
      let followItem = findRssItem(rssList, options.follow);
      if (!followItem) {
        return `未找到${options.follow}`;
      }
      let followers = followItem.followers;
      let followIndex = followers.findIndex((followId) => followId == author);
      if (followIndex > -1) {
        followers.splice(followIndex, 1);
        await ctx.database.set("rsssc", { id: followItem.id }, { followers });
        return `取消关注：${followItem.title}`;
      } else {
        followers.push(author);
        await ctx.database.set("rsssc", { id: followItem.id }, { followers });
        return `关注订阅：${followItem.title}`;
      }
    }
    if (options?.followAll) {
      if (authority < config.basic.advancedAuthority) {
        return `权限不足，请联系管理员提权
平台名:${platform}
帐号:${author}
当前权限等级:${authority}
需求权限等级:${config.basic.advancedAuthority}`;
      }
      debug(`follow:${options.followAll}`, "", "info");
      let followItem = findRssItem(rssList, options.followAll);
      if (!followItem) {
        return `未找到${options.followAll}`;
      }
      let followers = followItem.followers;
      let followIndex = followers.findIndex((followId) => followId == "all");
      if (followIndex > -1) {
        followers.splice(followIndex, 1);
        await ctx.database.set("rsssc", { id: followItem.id }, { followers });
        return `取消全体关注：${followItem.title}`;
      } else {
        followers.push("all");
        await ctx.database.set("rsssc", { id: followItem.id }, { followers });
        return `全体关注订阅：${followItem.title}`;
      }
    }
    if (options.pull) {
      let item2 = rssList.find((i) => i.rssId === +options.pull) || rssList.find((i) => i.url == options.pull) || rssList.find((i) => i.url.indexOf(options.pull) + 1) || rssList.find((i) => i.title.indexOf(options.pull) + 1);
      if (item2 == -1) {
        return `未找到${options.pull}`;
      }
      debug(`pull:${item2.title}`, "", "info");
      let { url: url2, author: author2, arg: arg2 } = item2;
      arg2 = mixinArg(arg2);
      let rssItemList = await Promise.all(url2.split("|").map((i) => parseQuickUrl(i)).map(async (url3) => await getRssData(url3, arg2)));
      let itemArray = rssItemList.flat(1).sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
      debug(itemArray, "itemArray", "info");
      let rssItemArray = itemArray.filter((v, i) => arg2.forceLength ? i < arg2.forceLength : i < 1).filter((v, i) => arg2.maxRssItem ? i < arg2.maxRssItem : true);
      debug(rssItemArray, "rssItemArray", "info");
      let messageList = (await Promise.all(rssItemArray.reverse().map(async (i) => await parseRssItem(i, { ...item2, ...arg2 }, author2)))).flat(Infinity);
      debug(messageList, "mergeItem", "info");
      return `<message forward>${messageList.join("")}</message>`;
    }
    let item;
    let optionArg = formatArg(options);
    let arg = mixinArg(optionArg);
    let urlList = url?.split("|")?.map((i) => parseQuickUrl(i));
    const subscribe = {
      url,
      platform,
      guildId,
      author,
      rssId: (+rssList.slice(-1)?.[0]?.rssId || 0) + 1,
      arg: optionArg,
      lastContent: { itemArray: [] },
      title: options.title || urlList.length > 1 && `订阅组:${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN")}` || "",
      lastPubDate: /* @__PURE__ */ new Date()
    };
    if (options.target) {
      if (authority < config.basic.advancedAuthority) {
        return `权限不足，请联系管理员提权
平台名:${platform}
帐号:${author}
当前权限等级:${authority}
需求权限等级:${config.basic.advancedAuthority}`;
      }
      let targetGuildId = +options.target;
      if (!targetGuildId) {
        return "请输入群ID";
      }
      subscribe.guildId = targetGuildId;
      const _rssList = await ctx.database.get("rsssc", { platform, guildId: targetGuildId });
      subscribe.rssId = (+_rssList.slice(-1)?.[0]?.rssId || 0) + 1;
    }
    if (authority < config.basic.authority) {
      return `权限不足，请联系管理员提权
平台名:${platform}
帐号:${author}
当前权限等级:${authority}
需求权限等级:${config.basic.authority}`;
    }
    if (options.test) {
      debug(`test:${url}`, "", "info");
      debug({ guildId, platform, author, arg, optionArg }, "", "info");
      try {
        if (!url)
          return "请输入URL";
        let rssItemList;
        try {
          rssItemList = await Promise.all(urlList.map(async (url2) => await getRssData(url2, arg)));
        } catch (error) {
          throw new Error(`订阅源请求失败:${error}
请检查url是否可用:${urlList.map((i) => parseQuickUrl(i)).join()}`);
        }
        let itemArray = rssItemList.flat(1).sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
        let rssItemArray = itemArray.filter((v, i) => arg.forceLength ? i < arg.forceLength : i < 1).filter((v, i) => arg.maxRssItem ? i < arg.maxRssItem : true);
        let messageList;
        try {
          messageList = (await Promise.all(rssItemArray.reverse().map(async (i) => await parseRssItem(i, { ...subscribe, ...arg }, author)))).flat(Infinity);
        } catch (error) {
          throw new Error(`订阅内容请求失败:${error}`);
        }
        return `<message forward>${messageList.join("")}</message>`;
      } catch (error) {
        return `error:${error}`;
      }
    }
    if (config.basic.urlDeduplication && rssList.findIndex((i) => i.url == url) + 1) {
      return "已订阅此链接。";
    }
    debug(url, "", "info");
    if (!url) {
      return "未输入url";
    }
    debug(subscribe, "subscribe", "info");
    if (options.force) {
      await ctx.database.create("rsssc", subscribe);
      return "添加订阅成功";
    }
    try {
      if (!url)
        return "请输入URL";
      let rssItemList;
      if (config.net.proxyAgent.autoUseProxy && optionArg?.proxyAgent?.enabled === void 0) {
        try {
          rssItemList = await Promise.all(urlList.map(async (url2) => await getRssData(url2, { ...arg, proxyAgent: { enabled: false } })));
        } catch (error) {
          optionArg.proxyAgent = { enabled: true };
          rssItemList = await Promise.all(urlList.map(async (url2) => await getRssData(url2, arg)));
        }
      } else {
        rssItemList = await Promise.all(urlList.map(async (url2) => await getRssData(url2, arg)));
      }
      let itemArray = rssItemList.flat(1).sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate)).filter((v, i) => arg.forceLength ? i < arg.forceLength : i < 1).filter((v, i) => arg.maxRssItem ? i < arg.maxRssItem : true);
      if (urlList.length === 1)
        subscribe.title = subscribe.title || itemArray[0].rss.channel.title;
      item = itemArray[0];
      if (!(item.pubDate || optionArg.forceLength)) {
        return "RSS中未找到可用的pubDate，这将导致无法取得更新时间，请使用forceLength属性强制在每次更新时取得最新的订阅内容";
      }
      subscribe.rssId = (+(await ctx.database.get("rsssc", { platform, guildId })).slice(-1)?.[0]?.rssId || 0) + 1;
      subscribe.lastPubDate = new Date(item.pubDate) || subscribe.lastPubDate;
      subscribe.lastContent = { itemArray: config.basic.resendUpdataContent === "all" ? rssItemList.flat(1).map(getLastContent) : config.basic.resendUpdataContent === "latest" ? [getLastContent(itemArray[0])] : [] };
      itemArray = arg.forceLength ? itemArray : [itemArray[0]];
      let messageList;
      if (config.net.proxyAgent.autoUseProxy && optionArg?.proxyAgent?.enabled === void 0 && !optionArg.proxyAgent) {
        try {
          messageList = await Promise.all(itemArray.map(async () => await parseRssItem(item, { ...subscribe, ...arg, proxyAgent: { enabled: false } }, item.author)));
          optionArg.proxyAgent = { enabled: false };
        } catch (error) {
          messageList = await Promise.all(itemArray.map(async () => await parseRssItem(item, { ...subscribe, ...arg }, item.author)));
          optionArg.proxyAgent = { enabled: true };
        }
        subscribe.arg = optionArg;
      } else {
        messageList = await Promise.all(itemArray.map(async () => await parseRssItem(item, { ...subscribe, ...arg }, item.author)));
      }
      ctx.database.create("rsssc", subscribe);
      return arg.firstLoad ? `<message>添加订阅成功</message>${arg.merge ? `<message forward><author id="${item.author}"/>${messageList.join("")}</message>` : messageList.join("")}` : "添加订阅成功";
    } catch (error) {
      debug(error, "添加失败", "error");
      return `添加失败:${error}`;
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
