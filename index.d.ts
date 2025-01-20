import { Context, Schema } from 'koishi';
export declare const name = "RSS-OWL";
export declare const inject: {
    required: string[];
    optional: string[];
};
declare module 'koishi' {
    interface rssOwl {
        id: string | number;
        url: string;
        platform: string;
        guildId: string;
        author: string;
        rssId: number;
        arg: rssArg;
        title: string;
        lastPubDate: Date;
    }
}
interface Config {
    basic?: BasicConfig;
    template?: TemplateConfig;
    net?: NetConfig;
    msg?: MsgConfig;
    debug?: "disable" | "error" | "info" | "details";
}
interface BasicConfig {
    usePoster: boolean;
    margeVideo: boolean;
    defaultTemplate?: 'auto' | 'content' | 'only text' | 'only media' | 'only image' | 'proto' | 'default' | 'only description' | 'custom' | 'link';
    timeout?: number;
    refresh?: number;
    merge?: '不合并' | '有多条更新时合并' | '一直合并';
    maxRssItem?: number;
    firstLoad?: boolean;
    urlDeduplication?: boolean;
    resendUpdataContent: 'disable' | 'latest' | 'all';
    imageMode?: 'base64' | 'File';
    videoMode?: 'filter' | 'href' | 'base64' | 'File';
    autoSplitImage?: boolean;
    cacheDir?: string;
    replaceDir?: string;
    authority: number;
    advancedAuthority: number;
}
interface TemplateConfig {
    customRemark: string;
    bodyWidth?: number;
    bodyPadding?: number;
    bodyFontSize?: number;
    content?: string;
    custom?: string;
    customTemplate: any[];
}
interface NetConfig {
    userAgent?: string;
    proxyAgent?: proxyAgent;
}
interface MsgConfig {
    censor?: boolean;
    keywordFilter?: Array<string>;
    keywordBlock?: Array<string>;
    blockString?: string;
    rssHubUrl?: string;
}
interface proxyAgent {
    enabled?: boolean;
    autoUseProxy?: boolean;
    protocol?: string;
    host?: string;
    port?: number;
    auth?: auth;
}
interface auth {
    enabled: boolean;
    username: string;
    password: string;
}
export interface rss {
    url: string;
    id: string | number;
    arg: rssArg;
    title: string;
    author: string;
    lastPubDate: Date;
}
export interface rssArg {
    template?: 'auto' | 'content' | 'only text' | 'only media' | 'only image' | 'only video' | 'proto' | 'default' | 'only description' | 'custom' | 'link';
    content: string | never;
    forceLength?: number;
    timeout?: number;
    interval?: number;
    reverse?: boolean;
    firstLoad?: boolean;
    merge?: boolean;
    maxRssItem?: number;
    proxyAgent?: proxyAgent;
    bodyWidth?: number;
    bodyPadding?: number;
    filter?: Array<string>;
    block?: Array<string>;
    split?: number;
    nextUpdataTime?: number;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    basic: Schema<Schemastery.ObjectS<{
        defaultTemplate: Schema<string, string>;
        timeout: Schema<number, number>;
        refresh: Schema<number, number>;
        authority: Schema<number, number>;
        advancedAuthority: Schema<number, number>;
        merge: Schema<"不合并" | "有多条更新时合并" | "一直合并", "不合并" | "有多条更新时合并" | "一直合并">;
        maxRssItem: Schema<number, number>;
        firstLoad: Schema<boolean, boolean>;
        urlDeduplication: Schema<boolean, boolean>;
        resendUpdataContent: Schema<"disable" | "latest" | "all", "disable" | "latest" | "all">;
        imageMode: Schema<"base64" | "File", "base64" | "File">;
        videoMode: Schema<"base64" | "File" | "filter" | "href", "base64" | "File" | "filter" | "href">;
        margeVideo: Schema<boolean, boolean>;
        usePoster: Schema<boolean, boolean>;
        autoSplitImage: Schema<boolean, boolean>;
        cacheDir: Schema<string, string>;
        replaceDir: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        defaultTemplate: Schema<string, string>;
        timeout: Schema<number, number>;
        refresh: Schema<number, number>;
        authority: Schema<number, number>;
        advancedAuthority: Schema<number, number>;
        merge: Schema<"不合并" | "有多条更新时合并" | "一直合并", "不合并" | "有多条更新时合并" | "一直合并">;
        maxRssItem: Schema<number, number>;
        firstLoad: Schema<boolean, boolean>;
        urlDeduplication: Schema<boolean, boolean>;
        resendUpdataContent: Schema<"disable" | "latest" | "all", "disable" | "latest" | "all">;
        imageMode: Schema<"base64" | "File", "base64" | "File">;
        videoMode: Schema<"base64" | "File" | "filter" | "href", "base64" | "File" | "filter" | "href">;
        margeVideo: Schema<boolean, boolean>;
        usePoster: Schema<boolean, boolean>;
        autoSplitImage: Schema<boolean, boolean>;
        cacheDir: Schema<string, string>;
        replaceDir: Schema<string, string>;
    }>>;
    template: Schema<Schemastery.ObjectS<{
        bodyWidth: Schema<number, number>;
        bodyPadding: Schema<number, number>;
        bodyFontSize: Schema<number, number>;
        content: Schema<string, string>;
        custom: Schema<string, string>;
        customRemark: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        bodyWidth: Schema<number, number>;
        bodyPadding: Schema<number, number>;
        bodyFontSize: Schema<number, number>;
        content: Schema<string, string>;
        custom: Schema<string, string>;
        customRemark: Schema<string, string>;
    }>>;
    net: Schema<Schemastery.ObjectS<{
        proxyAgent: Schema<Schemastery.ObjectS<{}>, {} & import("cosmokit").Dict>;
        userAgent: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        proxyAgent: Schema<Schemastery.ObjectS<{}>, {} & import("cosmokit").Dict>;
        userAgent: Schema<string, string>;
    }>>;
    msg: Schema<Schemastery.ObjectS<{
        rssHubUrl: Schema<string, string>;
        keywordFilter: Schema<string[], string[]>;
        keywordBlock: Schema<string[], string[]>;
        blockString: Schema<string, string>;
        censor: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        rssHubUrl: Schema<string, string>;
        keywordFilter: Schema<string[], string[]>;
        keywordBlock: Schema<string[], string[]>;
        blockString: Schema<string, string>;
        censor: Schema<boolean, boolean>;
    }>>;
    debug: Schema<string, string>;
}>, Schemastery.ObjectT<{
    basic: Schema<Schemastery.ObjectS<{
        defaultTemplate: Schema<string, string>;
        timeout: Schema<number, number>;
        refresh: Schema<number, number>;
        authority: Schema<number, number>;
        advancedAuthority: Schema<number, number>;
        merge: Schema<"不合并" | "有多条更新时合并" | "一直合并", "不合并" | "有多条更新时合并" | "一直合并">;
        maxRssItem: Schema<number, number>;
        firstLoad: Schema<boolean, boolean>;
        urlDeduplication: Schema<boolean, boolean>;
        resendUpdataContent: Schema<"disable" | "latest" | "all", "disable" | "latest" | "all">;
        imageMode: Schema<"base64" | "File", "base64" | "File">;
        videoMode: Schema<"base64" | "File" | "filter" | "href", "base64" | "File" | "filter" | "href">;
        margeVideo: Schema<boolean, boolean>;
        usePoster: Schema<boolean, boolean>;
        autoSplitImage: Schema<boolean, boolean>;
        cacheDir: Schema<string, string>;
        replaceDir: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        defaultTemplate: Schema<string, string>;
        timeout: Schema<number, number>;
        refresh: Schema<number, number>;
        authority: Schema<number, number>;
        advancedAuthority: Schema<number, number>;
        merge: Schema<"不合并" | "有多条更新时合并" | "一直合并", "不合并" | "有多条更新时合并" | "一直合并">;
        maxRssItem: Schema<number, number>;
        firstLoad: Schema<boolean, boolean>;
        urlDeduplication: Schema<boolean, boolean>;
        resendUpdataContent: Schema<"disable" | "latest" | "all", "disable" | "latest" | "all">;
        imageMode: Schema<"base64" | "File", "base64" | "File">;
        videoMode: Schema<"base64" | "File" | "filter" | "href", "base64" | "File" | "filter" | "href">;
        margeVideo: Schema<boolean, boolean>;
        usePoster: Schema<boolean, boolean>;
        autoSplitImage: Schema<boolean, boolean>;
        cacheDir: Schema<string, string>;
        replaceDir: Schema<string, string>;
    }>>;
    template: Schema<Schemastery.ObjectS<{
        bodyWidth: Schema<number, number>;
        bodyPadding: Schema<number, number>;
        bodyFontSize: Schema<number, number>;
        content: Schema<string, string>;
        custom: Schema<string, string>;
        customRemark: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        bodyWidth: Schema<number, number>;
        bodyPadding: Schema<number, number>;
        bodyFontSize: Schema<number, number>;
        content: Schema<string, string>;
        custom: Schema<string, string>;
        customRemark: Schema<string, string>;
    }>>;
    net: Schema<Schemastery.ObjectS<{
        proxyAgent: Schema<Schemastery.ObjectS<{}>, {} & import("cosmokit").Dict>;
        userAgent: Schema<string, string>;
    }>, Schemastery.ObjectT<{
        proxyAgent: Schema<Schemastery.ObjectS<{}>, {} & import("cosmokit").Dict>;
        userAgent: Schema<string, string>;
    }>>;
    msg: Schema<Schemastery.ObjectS<{
        rssHubUrl: Schema<string, string>;
        keywordFilter: Schema<string[], string[]>;
        keywordBlock: Schema<string[], string[]>;
        blockString: Schema<string, string>;
        censor: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        rssHubUrl: Schema<string, string>;
        keywordFilter: Schema<string[], string[]>;
        keywordBlock: Schema<string[], string[]>;
        blockString: Schema<string, string>;
        censor: Schema<boolean, boolean>;
    }>>;
    debug: Schema<string, string>;
}>>;
export declare function apply(ctx: Context, config: Config): void;
export {};
