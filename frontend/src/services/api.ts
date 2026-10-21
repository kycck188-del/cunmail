// refactor: 将导入从 'database' 包更改为本地的类型定义文件
import type { Email } from "../database_types";

const API_BASE_URL = "/api";

// fix: 移除不再需要的 ApiPayload 接口定义

// 获取邮件列表：通过邮箱地址查询，不需要邮箱访问令牌
export async function getEmails(
  address: string,
  limit: number = 50,
): Promise<Email[]> {
  const response = await fetch(`${API_BASE_URL}/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, limit }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}


export interface MailboxMeta {
  count: number;
  latestEmailCreatedAt: string | null;
}

// 获取邮箱统计信息：不需要邮箱访问令牌
export async function getMailboxMeta(
  address: string,
): Promise<MailboxMeta> {
  const response = await fetch(`${API_BASE_URL}/emails/meta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mailbox meta");
  }

  return response.json();
}


export interface MailboxAuthorizationResponse {
  success: boolean;
  bypassed?: boolean;
  mailbox: string;
}
export async function verifyTurnstile(
  domain: string,
  token?: string,
  prefix?: string,
  randomLength: 6 | 8 | 10 | 12 = 8,
): Promise<MailboxAuthorizationResponse> {
  const body: {
    domain: string;
    token?: string;
    prefix?: string;
    randomLength?: number;
  } = { domain };

  if (token) {
    body.token = token;
  }

  if (prefix !== undefined && prefix.trim() !== "") {
    body.prefix = prefix.trim();
  } else {
    body.randomLength = randomLength;
  }

  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Turnstile verification failed");
  }

  return response.json();
}


// 获取单封邮件详情：使用邮箱地址和邮件 ID 查询
export async function getEmailById(
  id: string,
  address: string,
): Promise<Email> {
  const response = await fetch(
    `${API_BASE_URL}/emails/${encodeURIComponent(id)}?address=${encodeURIComponent(address)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch email");
  }

  return response.json();
}


// 删除邮件：通过邮箱地址和邮件 ID 删除
export async function deleteEmails(
  ids: string[],
  address: string,
): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE_URL}/delete-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, ids }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete emails");
  }

  return response.json();
}


// feat: 添加密码登录函数
// fix: 移除 token 参数，因为登录流程不再需要人机验证

export async function loginByPassword(
  password: string,
): Promise<{ address: string }> {

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }
  return response.json();
}

export async function refreshMailboxToken(
  mailboxToken: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/mailbox-token/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${mailboxToken}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to refresh mailbox authorization",
    );
  }
  const data = (await response.json()) as { mailboxToken: string };
  return data.mailboxToken;
}

// 站点统计数据类型
export interface StatsSnapshot {
  totalAddressesCreated: number;
  totalEmailsReceived: number;
  totalApiCalls: number;
  totalApiKeysCreated: number;
}

export interface SiteStats {
  totals: StatsSnapshot;
}

// 获取站点统计数据
export async function getSiteStats(): Promise<SiteStats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch site stats");
  }
  return response.json();
}

export interface UnlockStatusResponse {
  unlocked: boolean;
  sitePasswordEnabled: boolean;
}

export async function getUnlockStatus(): Promise<UnlockStatusResponse> {
  const response = await fetch("/auth/status");
  if (!response.ok) {
    throw new Error("Failed to fetch unlock status");
  }
  return response.json();
}

export async function unlockSite(
  password: string,
): Promise<{ success: boolean }> {
  const response = await fetch("/auth/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Invalid password");
  }

  return response.json();
}
