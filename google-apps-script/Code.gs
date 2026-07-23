const BASE_PROFILES = [
  {
    account_token: "EtPYmtW+xFXJpV5CtBK4Y9Ap",
    id: "4468761606",
    server: "2",
    language: "en",
    accountName: "Muzaka"
  },
  {
    account_token: "oczYQya1csPPEcpzriAnTIUn",
    id: "4896434342",
    server: "2",
    language: "en",
    accountName: "Orion"
  },
  {
    account_token: "Dw2W7cTTxS8PcEZaAxaQmnXx",
    id: "4367542843",
    server: "2",
    language: "en",
    accountName: "Naskara"
  }
];

const discord_notify = true;
const myDiscordID = "1004215676208156722";
const discordWebhook = "https://discordapp.com/api/webhooks/1502346685291171910/Y5egIJmMzuol81UHwkuzU_BGj9JUVKhEy7OAFsAwxPjyS3T0h0_S7HKOMXBehTX2azUe";

const APP_CODE = "6eb76d4e13aa36e6";
const BASE_URL = "https://zonai.skport.com/web/v1";
const CARD_DETAIL_URL =
  "https://zonai.skport.com/api/v1/game/endfield/card/detail";

const STATE_PROPERTY_KEY = "ENDFIELD_DASHBOARD_STATE_V3";
const STATE_META_PROPERTY_KEY =
  "ENDFIELD_DASHBOARD_META_V4";
const STATE_ACCOUNT_INDEX_KEY =
  "ENDFIELD_DASHBOARD_ACCOUNT_INDEX_V4";
const STATE_ACCOUNT_PREFIX =
  "ENDFIELD_DASHBOARD_ACCOUNT_V4_";
const SCRIPT_PROPERTY_SAFE_BYTES = 8600;
const STATE_UPDATED_MS_KEY = "ENDFIELD_DASHBOARD_UPDATED_MS_V3";
const STATE_REVISION_KEY = "ENDFIELD_DASHBOARD_REVISION_V3";
const STATE_MAX_AGE_MS = 4000;
const PLAYER_BINDING_CACHE_SECONDS = 30;
const AUTH_CACHE_SECONDS = 1500;
const LINKED_ACCOUNTS_PROPERTY_KEY =
  "ENDFIELD_LINKED_ACCOUNTS_V1";
const MAX_LINKED_ACCOUNTS = 10;
const DELETE_PIN_HASH_PROPERTY_KEY =
  "ENDFIELD_DELETE_PIN_SHA256";
const ACCOUNT_PREFS_PROPERTY_KEY =
  "ENDFIELD_ACCOUNT_PREFS_V1";
const HISTORY_SANITY_PREFIX =
  "ENDFIELD_HISTORY_SANITY_";
const HISTORY_CHECKIN_PREFIX =
  "ENDFIELD_HISTORY_CHECKIN_";
const HISTORY_UPTIME_PROPERTY_KEY =
  "ENDFIELD_HISTORY_UPTIME_V1";
const QUOTA_PROPERTY_KEY =
  "ENDFIELD_QUOTA_GUARD_V1";
const PUSH_SUBSCRIPTION_INDEX_KEY =
  "ENDFIELD_PUSH_SUB_INDEX_V1";
const PUSH_SUBSCRIPTION_PREFIX =
  "ENDFIELD_PUSH_SUB_";
const PUSH_QUEUE_INDEX_KEY =
  "ENDFIELD_PUSH_QUEUE_INDEX_V1";
const PUSH_QUEUE_PREFIX =
  "ENDFIELD_PUSH_EVENT_";
const PUSH_CONDITIONS_PROPERTY_KEY =
  "ENDFIELD_PUSH_CONDITIONS_V1";
const PUSH_BATCH_SECRET_PROPERTY_KEY =
  "ENDFIELD_PUSH_BATCH_SECRET";
const MAX_PUSH_SUBSCRIPTIONS = 20;
const MAX_PUSH_QUEUE = 80;

let EXECUTION_METRICS = {
  urlFetches: 0,
  propertyWrites: 0,
  failures: 0
};

const DEFAULT_DELETE_PIN_SHA256 =
  "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";

const DASHBOARD_API_VERSION =
  "31.0";

const DASHBOARD_API_ACTIONS = [
  "state",
  "sync",
  "run",
  "addAccount",
  "updateAccount",
  "reorderAccounts",
  "syncAccount",
  "deleteAccount",
  "history",
  "tokenHealth",
  "quotaStatus",
  "exportConfig",
  "restoreConfig",
  "registerPush",
  "unregisterPush",
  "pushBatch",
  "ackPush",
  "capabilities"
];

const urlDict = {
  Endfield: `${BASE_URL}/game/endfield/attendance`,
  PlayerBinding:
    "https://zonai.skport.com/api/v1/game/player/binding",
  CardDetail: CARD_DETAIL_URL
};

const headerDict = {
  default: {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
    "Referer": "https://game.skport.com/",
    "platform": "3",
    "vName": "1.0.0",
    "Origin": "https://game.skport.com",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Priority": "u=0",
    "TE": "trailers"
  }
};

function doGet(e) {
  const parameters =
    e && e.parameter ? e.parameter : {};

  const action =
    String(parameters.action || "").toLowerCase();

  let payload;

  try {
    if (!action) {
      payload = {
        success: true,
        status: "API OK",
        apiVersion:
          DASHBOARD_API_VERSION,
        actions:
          DASHBOARD_API_ACTIONS,
        message:
          "Endfield Dashboard API aktif."
      };
    } else if (action === "state") {
      payload = {
        success: true,
        state: getDashboardState(false, "browser-state")
      };
    } else if (action === "sync") {
      payload = {
        success: true,
        state: getDashboardState(true, "manual-refresh")
      };
    } else if (action === "run" || action === "checkin") {
      payload = main();
    } else if (action === "addaccount") {
      payload = addLinkedAccount(parameters.account_token);
    } else if (action === "updateaccount") {
      payload = updateAccountPreferences(
        parameters.slug,
        parameters.display_name,
        parameters.primary,
        parameters.notifications
      );
    } else if (action === "reorderaccounts") {
      payload = reorderAccountPreferences(parameters.order);
    } else if (action === "syncaccount") {
      payload = {
        success: true,
        state: syncDashboardAccount(parameters.slug, "single-account")
      };
    } else if (action === "history") {
      payload = {
        success: true,
        history: readHistoryData()
      };
    } else if (action === "tokenhealth") {
      payload = getTokenHealth(parameters.slug);
    } else if (action === "quotastatus") {
      payload = {
        success: true,
        quota: readQuotaMetrics()
      };
    } else if (action === "exportconfig") {
      payload = exportSafeConfiguration();
    } else if (action === "registerpush") {
      payload = registerPushSubscription(parameters.subscription, parameters.user_agent);
    } else if (action === "unregisterpush") {
      payload = unregisterPushSubscription(parameters.endpoint);
    } else if (action === "pushbatch") {
      payload = buildPushBatch(parameters.secret);
    } else if (action === "ackpush") {
      payload = acknowledgePushBatch(parameters.secret, parameters.ids, parameters.expired_endpoints);
    } else if (
      action === "capabilities" ||
      action === "version" ||
      action === "ping"
    ) {
      payload = {
        success: true,
        status: "API OK",
        apiVersion:
          DASHBOARD_API_VERSION,
        actions:
          DASHBOARD_API_ACTIONS
      };
    } else if (
      action === "deleteaccount" ||
      action === "removeaccount" ||
      action === "delete" ||
      action === "remove"
    ) {
      payload =
        deleteLinkedAccount(
          parameters.slug,
          parameters.pin
        );
    } else {
      payload = {
        success: false,
        status: "ERROR",
        apiVersion:
          DASHBOARD_API_VERSION,
        actions:
          DASHBOARD_API_ACTIONS,
        message:
          `Action '${action}' tidak dikenali oleh API v${DASHBOARD_API_VERSION}.`
      };
    }
  } catch (error) {
    payload = {
      success: false,
      message:
        error && error.message
          ? error.message
          : String(error)
    };
  }

  flushExecutionMetrics(
    action || "root",
    Boolean(payload && payload.success !== false)
  );

  if (
    payload &&
    typeof payload === "object" &&
    payload.apiVersion === undefined
  ) {
    payload.apiVersion =
      DASHBOARD_API_VERSION;
  }

  return createApiOutput(
    payload,
    parameters.callback
  );
}

function doPost(e) {
  const parameters = e && e.parameter ? e.parameter : {};
  const action = String(parameters.action || "").toLowerCase();
  let payload;

  try {
    if (action === "restoreconfig") {
      payload = restoreSafeConfiguration(parameters.config);
    } else if (action === "registerpush") {
      payload = registerPushSubscription(parameters.subscription, parameters.user_agent);
    } else if (action === "unregisterpush") {
      payload = unregisterPushSubscription(parameters.endpoint);
    } else {
      payload = { success: false, message: `POST action '${action}' tidak dikenali.` };
    }
  } catch (error) {
    EXECUTION_METRICS.failures += 1;
    payload = { success: false, message: error && error.message ? error.message : String(error) };
  }

  flushExecutionMetrics(action || "post", Boolean(payload && payload.success !== false));
  if (payload && typeof payload === "object" && payload.apiVersion === undefined) payload.apiVersion = DASHBOARD_API_VERSION;

  if (String(parameters.response_mode || "").toLowerCase() === "postmessage") {
    return createPostMessageOutput(payload, parameters.nonce);
  }
  return createApiOutput(payload, "");
}

function createPostMessageOutput(payload, nonce) {
  const safePayload = JSON.stringify(payload).replace(/</g, "\\u003c");
  const safeNonce = JSON.stringify(String(nonce || ""));
  const html = '<!doctype html><meta charset="utf-8"><script>' +
    'window.parent.postMessage({source:"endfield-gas-post",nonce:' + safeNonce + ',payload:' + safePayload + '},"*");' +
    '<' + '/script>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createApiOutput(payload, callback) {
  const json = JSON.stringify(payload);
  const callbackName = String(callback || "").trim();

  if (
    callbackName &&
    /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callbackName)
  ) {
    return ContentService
      .createTextOutput(
        `${callbackName}(${json});`
      )
      .setMimeType(
        ContentService.MimeType.JAVASCRIPT
      );
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function trackedFetch(url, options) {
  EXECUTION_METRICS.urlFetches += 1;
  try {
    return UrlFetchApp.fetch(url, options);
  } catch (error) {
    EXECUTION_METRICS.failures += 1;
    throw error;
  }
}

function notePropertyWrite(count) {
  EXECUTION_METRICS.propertyWrites += Number(count || 1);
}

function quotaDateKey() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
}

function readQuotaMetrics() {
  const raw = PropertiesService.getScriptProperties().getProperty(QUOTA_PROPERTY_KEY);
  let metrics = {};
  try { metrics = raw ? JSON.parse(raw) : {}; } catch (_) { metrics = {}; }
  const today = quotaDateKey();
  if (metrics.date !== today) {
    metrics = { date: today, requests: 0, urlFetches: 0, propertyWrites: 0, failures: 0, actions: {}, updatedAt: null };
  }
  return metrics;
}

function flushExecutionMetrics(action, successful) {
  try {
    const metrics = readQuotaMetrics();
    metrics.requests += 1;
    metrics.urlFetches += EXECUTION_METRICS.urlFetches;
    metrics.propertyWrites += EXECUTION_METRICS.propertyWrites + 1;
    metrics.failures += EXECUTION_METRICS.failures + (successful ? 0 : 1);
    metrics.actions[action] = Number(metrics.actions[action] || 0) + 1;
    metrics.updatedAt = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty(QUOTA_PROPERTY_KEY, JSON.stringify(metrics));
  } catch (_) {}
  EXECUTION_METRICS = { urlFetches: 0, propertyWrites: 0, failures: 0 };
}

function readJsonProperty(key, fallback) {
  const raw = PropertiesService.getScriptProperties().getProperty(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch (_) { return fallback; }
}

function writeJsonProperty(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value));
  notePropertyWrite(1);
}

function parseJsonValue(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch (_) { return fallback; }
}

function historySanityKey(slug) {
  return HISTORY_SANITY_PREFIX + String(slug || "account").replace(/[^a-z0-9_-]/gi, "-").slice(0, 80);
}

function historyCheckinKey(dateKey) {
  return HISTORY_CHECKIN_PREFIX + String(dateKey || quotaDateKey()).replace(/[^0-9-]/g, "");
}

function recentDateKeys(days) {
  const keys = [];
  for (let offset = 0; offset < days; offset++) {
    const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    keys.push(Utilities.formatDate(date, "Asia/Jakarta", "yyyy-MM-dd"));
  }
  return keys;
}

function readHistoryData() {
  const properties = PropertiesService.getScriptProperties().getProperties();
  const sanity = {};
  Object.keys(properties).forEach(key => {
    if (!key.startsWith(HISTORY_SANITY_PREFIX)) return;
    const slug = key.slice(HISTORY_SANITY_PREFIX.length);
    const rows = parseJsonValue(properties[key], []);
    sanity[slug] = Array.isArray(rows) ? rows : [];
  });

  const checkins = [];
  recentDateKeys(31).reverse().forEach(dateKey => {
    const rows = parseJsonValue(properties[historyCheckinKey(dateKey)], []);
    if (Array.isArray(rows)) checkins.push(...rows);
  });

  const uptime = parseJsonValue(properties[HISTORY_UPTIME_PROPERTY_KEY], []);
  return {
    sanity: sanity,
    checkins: checkins.slice(-240),
    uptime: Array.isArray(uptime) ? uptime.slice(-96) : [],
    updatedAt: checkins.at(-1)?.at || uptime.at(-1)?.at || null
  };
}

function recordDashboardHistory(state, ok) {
  if (!state || !state.accounts) return;
  const properties = PropertiesService.getScriptProperties();
  const now = new Date().toISOString();
  const hourKey = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd-HH");
  const writes = {};

  Object.keys(state.accounts).forEach(slug => {
    const sanity = state.accounts[slug].live && state.accounts[slug].live.sanity;
    if (!sanity) return;
    const key = historySanityKey(slug);
    const rows = parseJsonValue(properties.getProperty(key), []);
    const safeRows = Array.isArray(rows) ? rows : [];
    const row = { at: now, hourKey: hourKey, current: Number(sanity.current || 0), max: Number(sanity.max || 0) };
    if (!safeRows.length || safeRows[safeRows.length - 1].hourKey !== hourKey) safeRows.push(row);
    else safeRows[safeRows.length - 1] = row;
    writes[key] = JSON.stringify(safeRows.slice(-96));
  });

  const uptime = parseJsonValue(properties.getProperty(HISTORY_UPTIME_PROPERTY_KEY), []);
  const safeUptime = Array.isArray(uptime) ? uptime : [];
  safeUptime.push({ at: now, ok: ok !== false });
  writes[HISTORY_UPTIME_PROPERTY_KEY] = JSON.stringify(safeUptime.slice(-96));
  properties.setProperties(writes);
  notePropertyWrite(Object.keys(writes).length);
}

function recordCheckinHistory(results) {
  const properties = PropertiesService.getScriptProperties();
  const now = new Date().toISOString();
  const today = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  const key = historyCheckinKey(today);
  const rows = parseJsonValue(properties.getProperty(key), []);
  const safeRows = Array.isArray(rows) ? rows : [];
  (results || []).forEach(result => {
    safeRows.push({
      at: now,
      slug: slugifyAccountName(result.accountName || "account"),
      success: !result.isError,
      message: String(result.statusMsg || (result.isError ? "Failed" : "Success")).slice(0, 120)
    });
  });
  properties.setProperty(key, JSON.stringify(safeRows.slice(-20)));
  notePropertyWrite(1);

  const keep = new Set(recentDateKeys(31).map(historyCheckinKey));
  Object.keys(properties.getProperties()).forEach(propertyKey => {
    if (propertyKey.startsWith(HISTORY_CHECKIN_PREFIX) && !keep.has(propertyKey)) {
      properties.deleteProperty(propertyKey);
      notePropertyWrite(1);
    }
  });
}

function getTokenHealth(slugValue) {
  const requestedSlug = String(slugValue || "").trim().toLowerCase();
  const profiles = getAllProfiles().filter(profile => !requestedSlug || profileStorageSlug(profile) === requestedSlug);
  const accounts = profiles.map(profile => {
    const slug = profileStorageSlug(profile);
    const row = {
      slug: slug,
      name: preferenceForSlug(slug).displayName || profile.accountName || slug,
      uid: String(profile.id || ""),
      server: String(profile.server || ""),
      status: "FAILED",
      oauth: "FAILED",
      binding: "NOT TESTED",
      checkedAt: new Date().toISOString(),
      message: ""
    };
    try {
      clearCachedOAuth(profile);
      const auth = performOAuthFlowCached(profile, true);
      row.oauth = auth && auth.cred ? "VALID" : "FAILED";
      const binding = getPlayerProfile(auth.cred, auth.salt, profile);
      row.binding = binding && binding.success ? "VALID" : "FAILED";
      row.status = binding && binding.success ? "VALID" : "PLAYER_BINDING_FAILED";
      row.message = binding && binding.success ? "Session and player binding are valid." : String(binding && binding.error || "Player Binding failed");
      if (binding && binding.roleId) row.uid = String(binding.roleId);
      if (binding && binding.serverName) row.server = binding.serverName;
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      row.status = /expired|invalid|401|403|token/i.test(message) ? "EXPIRED" : "AUTH_FAILED";
      row.message = message.slice(0, 260);
    }
    return row;
  });
  return { success: true, accounts: accounts, checkedAt: new Date().toISOString() };
}

function exportSafeConfiguration() {
  const profiles = getAllProfiles();
  const preferences = readAccountPreferences();
  return {
    success: true,
    config: {
      schema: "endfield-safe-config-v1",
      exportedAt: new Date().toISOString(),
      accounts: profiles.map(profile => {
        const slug = profileStorageSlug(profile);
        const preference = preferenceForSlug(slug);
        return {
          slug: slug,
          uid: String(profile.id || ""),
          server: String(profile.server || ""),
          linked: readLinkedProfiles().some(item => profileStorageSlug(item) === slug),
          displayName: preference.displayName,
          order: preference.order,
          primary: preference.primary,
          notifications: preference.notifications
        };
      })
    }
  };
}

function restoreSafeConfiguration(configValue) {
  let config;
  try { config = typeof configValue === "string" ? JSON.parse(configValue) : configValue; } catch (_) { return { success: false, message: "Backup JSON tidak valid." }; }
  if (!config || config.schema !== "endfield-safe-config-v1" || !Array.isArray(config.accounts)) return { success: false, message: "Backup schema tidak dikenali." };
  const validSlugs = new Set(getAllProfiles().map(profile => profileStorageSlug(profile)));
  const preferences = readAccountPreferences();
  config.accounts.forEach(item => {
    const slug = String(item.slug || "").toLowerCase();
    if (!validSlugs.has(slug)) return;
    preferences[slug] = {
      ...(preferences[slug] || {}),
      displayName: String(item.displayName || "").slice(0, 40),
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : 999,
      primary: Boolean(item.primary),
      notifications: parseNotificationPreferences(item.notifications)
    };
  });
  saveAccountPreferences(preferences);
  const state = stateWithCurrentPreferences(readStoredDashboardState() || createInitialDashboardState());
  writeStoredDashboardState(state);
  return { success: true, state: state };
}

function compactDigest(value) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || ""),
    Utilities.Charset.UTF_8
  );
  return digest.map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0")).join("").slice(0, 40);
}

function readStringIndex(key) {
  const rows = parseJsonValue(PropertiesService.getScriptProperties().getProperty(key), []);
  return Array.isArray(rows) ? rows.filter(value => typeof value === "string") : [];
}

function writeStringIndex(key, rows) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(rows));
  notePropertyWrite(1);
}

function pushSubscriptionKey(endpoint) {
  return PUSH_SUBSCRIPTION_PREFIX + compactDigest(endpoint);
}

function readPushSubscriptions() {
  const properties = PropertiesService.getScriptProperties();
  const index = readStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY);
  const subscriptions = [];
  index.forEach(key => {
    const row = parseJsonValue(properties.getProperty(key), null);
    if (row && row.endpoint && row.keys) subscriptions.push(row);
  });
  return subscriptions;
}

function registerPushSubscription(subscriptionValue, userAgent) {
  let subscription;
  try { subscription = typeof subscriptionValue === "string" ? JSON.parse(subscriptionValue) : subscriptionValue; } catch (_) { return { success: false, message: "Push subscription JSON tidak valid." }; }
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) return { success: false, message: "Push subscription tidak lengkap." };

  const properties = PropertiesService.getScriptProperties();
  const key = pushSubscriptionKey(subscription.endpoint);
  const index = readStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY).filter(item => item !== key);
  index.push(key);
  while (index.length > MAX_PUSH_SUBSCRIPTIONS) {
    const removed = index.shift();
    properties.deleteProperty(removed);
    notePropertyWrite(1);
  }
  properties.setProperty(key, JSON.stringify({
    endpoint: String(subscription.endpoint).slice(0, 2000),
    expirationTime: subscription.expirationTime || null,
    keys: { p256dh: String(subscription.keys.p256dh), auth: String(subscription.keys.auth) },
    userAgent: String(userAgent || "").slice(0, 300),
    createdAt: new Date().toISOString()
  }));
  notePropertyWrite(1);
  writeStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY, index);
  return { success: true, subscriptionCount: index.length };
}

function unregisterPushSubscription(endpoint) {
  const properties = PropertiesService.getScriptProperties();
  const key = pushSubscriptionKey(endpoint);
  const index = readStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY);
  const remaining = index.filter(item => item !== key);
  properties.deleteProperty(key);
  notePropertyWrite(1);
  writeStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY, remaining);
  return { success: true, removed: index.length - remaining.length };
}

function pushEventKey(id) {
  return PUSH_QUEUE_PREFIX + String(id || "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);
}

function readPushQueue() {
  const properties = PropertiesService.getScriptProperties();
  const index = readStringIndex(PUSH_QUEUE_INDEX_KEY);
  const events = [];
  index.forEach(id => {
    const row = parseJsonValue(properties.getProperty(pushEventKey(id)), null);
    if (row && row.id) events.push(row);
  });
  return events;
}

function enqueuePushEvent(event) {
  const properties = PropertiesService.getScriptProperties();
  const id = Utilities.getUuid();
  const index = readStringIndex(PUSH_QUEUE_INDEX_KEY);
  index.push(id);
  while (index.length > MAX_PUSH_QUEUE) {
    const removed = index.shift();
    properties.deleteProperty(pushEventKey(removed));
    notePropertyWrite(1);
  }
  properties.setProperty(pushEventKey(id), JSON.stringify({ id: id, createdAt: new Date().toISOString(), ...event }));
  notePropertyWrite(1);
  writeStringIndex(PUSH_QUEUE_INDEX_KEY, index);
}

function generatePushEventsFromState(state) {
  if (!state || !state.accounts) return;
  const conditions = readJsonProperty(PUSH_CONDITIONS_PROPERTY_KEY, {});
  const today = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  Object.keys(state.accounts).forEach(slug => {
    const account = state.accounts[slug];
    const name = account.display_name || (account.profile && account.profile.name) || slug;
    const settings = account.settings && account.settings.notifications || defaultNotificationPreferences();
    const sanity = account.live && account.live.sanity;
    if (settings.energyFull && sanity && Number(sanity.max) > 0) {
      const full = Number(sanity.current) >= Number(sanity.max);
      const key = `energy:${slug}`;
      if (full && !conditions[key]) enqueuePushEvent({ type: "energy", slug: slug, title: "Energy fully restored", body: `${name}: ${sanity.current}/${sanity.max} Sanity.`, url: `./?account=${slug}` });
      conditions[key] = full;
    }
    const daily = account.live && account.live.daily_activity;
    if (settings.dailyZero && daily && Number(daily.current) === 0 && Number(daily.max) > 0) {
      const key = `daily:${slug}:${today}`;
      if (!conditions[key]) enqueuePushEvent({ type: "activity", slug: slug, title: "Daily activity not started", body: `${name}: Activity Points masih 0/${daily.max}.`, url: `./?account=${slug}` });
      conditions[key] = true;
    }
    const weekly = account.live && account.live.weekly_routine;
    if (settings.weeklyIncomplete && weekly && Number(weekly.max) > 0 && Number(weekly.current) < Number(weekly.max)) {
      const day = Number(Utilities.formatDate(new Date(), "Asia/Jakarta", "u"));
      const key = `weekly:${slug}:${today}`;
      if (day >= 6 && !conditions[key]) enqueuePushEvent({ type: "activity", slug: slug, title: "Weekly routine incomplete", body: `${name}: ${weekly.current}/${weekly.max}.`, url: `./?account=${slug}` });
      if (day >= 6) conditions[key] = true;
    }
  });
  Object.keys(conditions).forEach(key => {
    if (key.startsWith("daily:") || key.startsWith("weekly:")) {
      const date = key.split(":").at(-1);
      if (date < today) delete conditions[key];
    }
  });
  writeJsonProperty(PUSH_CONDITIONS_PROPERTY_KEY, conditions);
}

function getPushBatchSecret() {
  return PropertiesService.getScriptProperties().getProperty(PUSH_BATCH_SECRET_PROPERTY_KEY) || "";
}

function setPushBatchSecret(secret) {
  const value = String(secret || "").trim();
  if (value.length < 24) throw new Error("Push batch secret minimal 24 karakter.");
  PropertiesService.getScriptProperties().setProperty(PUSH_BATCH_SECRET_PROPERTY_KEY, value);
  return { success: true };
}

function pushSecretValid(secret) {
  const stored = getPushBatchSecret();
  return Boolean(stored && String(secret || "") === stored);
}

function buildPushBatch(secret) {
  if (!pushSecretValid(secret)) return { success: false, message: "Push batch secret salah atau belum disetel." };
  let state = null;
  try {
    state = getDashboardState(true, "push-worker");
    generatePushEventsFromState(state);
  } catch (error) {
    EXECUTION_METRICS.failures += 1;
  }
  return {
    success: true,
    events: readPushQueue().slice(0, 20),
    subscriptions: readPushSubscriptions(),
    generatedAt: new Date().toISOString()
  };
}

function acknowledgePushBatch(secret, idsValue, expiredValue) {
  if (!pushSecretValid(secret)) return { success: false, message: "Push batch secret salah." };
  const properties = PropertiesService.getScriptProperties();
  const ids = new Set(String(idsValue || "").split(",").filter(Boolean));
  const expired = new Set(String(expiredValue || "").split("|").filter(Boolean));

  const queueIndex = readStringIndex(PUSH_QUEUE_INDEX_KEY);
  const remainingQueue = queueIndex.filter(id => !ids.has(id));
  ids.forEach(id => {
    properties.deleteProperty(pushEventKey(id));
    notePropertyWrite(1);
  });
  writeStringIndex(PUSH_QUEUE_INDEX_KEY, remainingQueue);

  const subscriptionIndex = readStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY);
  const remainingSubscriptions = [];
  subscriptionIndex.forEach(key => {
    const row = parseJsonValue(properties.getProperty(key), null);
    if (row && expired.has(row.endpoint)) {
      properties.deleteProperty(key);
      notePropertyWrite(1);
    } else if (row) {
      remainingSubscriptions.push(key);
    }
  });
  writeStringIndex(PUSH_SUBSCRIPTION_INDEX_KEY, remainingSubscriptions);
  return { success: true, remainingEvents: remainingQueue.length, subscriptions: remainingSubscriptions.length };
}


function triggerManualSign() {
  return main();
}

function syncDashboardNow() {
  return getDashboardState(
    true,
    "editor-manual"
  );
}

function setupRealtimeTrigger() {
  removeRealtimeTriggers();

  ScriptApp.newTrigger("scheduledDashboardSync")
    .timeBased()
    .everyMinutes(1)
    .create();

  return getDashboardState(
    true,
    "trigger-setup"
  );
}

function removeRealtimeTriggers() {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (
      trigger.getHandlerFunction() ===
      "scheduledDashboardSync"
    ) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function scheduledDashboardSync() {
  try {
    getDashboardState(
      true,
      "time-trigger"
    );
  } catch (error) {
    console.error(
      "Scheduled sync gagal:",
      error
    );
  }
}

function profileStorageSlug(profile) {
  const explicit =
    String(
      profile &&
      profile.accountSlug
        ? profile.accountSlug
        : ""
    ).trim();

  if (explicit) {
    return explicit;
  }

  return slugifyAccountName(
    profile &&
    profile.accountName
      ? profile.accountName
      : "account"
  );
}

function profileIdentityKey(profile) {
  return (
    String(
      profile &&
      profile.id
        ? profile.id
        : ""
    ) +
    "_" +
    String(
      profile &&
      profile.server
        ? profile.server
        : ""
    )
  );
}

function readAccountPreferences() {
  const raw = PropertiesService.getScriptProperties().getProperty(ACCOUNT_PREFS_PROPERTY_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveAccountPreferences(preferences) {
  PropertiesService.getScriptProperties().setProperty(ACCOUNT_PREFS_PROPERTY_KEY, JSON.stringify(preferences || {}));
  notePropertyWrite(1);
}

function defaultNotificationPreferences() {
  return { energyFull: true, dailyZero: true, weeklyIncomplete: false, checkinFailed: true };
}

function preferenceForSlug(slug) {
  const all = readAccountPreferences();
  const current = all[String(slug || "")] || {};
  return {
    displayName: String(current.displayName || ""),
    order: Number.isFinite(Number(current.order)) ? Number(current.order) : 999,
    primary: Boolean(current.primary),
    notifications: { ...defaultNotificationPreferences(), ...(current.notifications || {}) }
  };
}

function parseNotificationPreferences(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return {
      energyFull: parsed?.energyFull !== false,
      dailyZero: parsed?.dailyZero !== false,
      weeklyIncomplete: parsed?.weeklyIncomplete === true,
      checkinFailed: parsed?.checkinFailed !== false
    };
  } catch (_) {
    return defaultNotificationPreferences();
  }
}

function stateWithCurrentPreferences(state) {
  if (!state || !state.accounts) return state;
  Object.keys(state.accounts).forEach(slug => {
    const preference = preferenceForSlug(slug);
    state.accounts[slug].settings = preference;
    state.accounts[slug].display_name = preference.displayName || state.accounts[slug].display_name || null;
  });
  return state;
}

function updateAccountPreferences(slug, displayName, primary, notifications) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();
  if (!getAllProfiles().some(profile => profileStorageSlug(profile) === normalizedSlug)) {
    return { success: false, message: "Akun tidak ditemukan." };
  }
  const preferences = readAccountPreferences();
  if (String(primary || "") === "1") {
    Object.keys(preferences).forEach(key => { preferences[key] = { ...(preferences[key] || {}), primary: false }; });
  }
  const existing = preferences[normalizedSlug] || {};
  preferences[normalizedSlug] = {
    ...existing,
    displayName: String(displayName || "").trim().slice(0, 40),
    primary: String(primary || "") === "1",
    notifications: parseNotificationPreferences(notifications)
  };
  saveAccountPreferences(preferences);
  const state = stateWithCurrentPreferences(readStoredDashboardState() || createInitialDashboardState());
  writeStoredDashboardState(state);
  return { success: true, state };
}

function reorderAccountPreferences(orderValue) {
  const slugs = String(orderValue || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  const valid = new Set(getAllProfiles().map(profile => profileStorageSlug(profile)));
  const preferences = readAccountPreferences();
  slugs.forEach((slug, index) => {
    if (valid.has(slug)) preferences[slug] = { ...(preferences[slug] || {}), order: index + 1 };
  });
  saveAccountPreferences(preferences);
  const state = stateWithCurrentPreferences(readStoredDashboardState() || createInitialDashboardState());
  writeStoredDashboardState(state);
  return { success: true, state };
}

function readLinkedProfiles() {
  const raw =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        LINKED_ACCOUNTS_PROPERTY_KEY
      );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(profile =>
          profile &&
          profile.account_token &&
          profile.id &&
          profile.server
        )
      : [];
  } catch (error) {
    return [];
  }
}

function saveLinkedProfiles(profilesToSave) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      LINKED_ACCOUNTS_PROPERTY_KEY,
      JSON.stringify(
        profilesToSave.slice(
          0,
          MAX_LINKED_ACCOUNTS
        )
      )
    );
}

function getAllProfiles() {
  const merged =
    new Map();

  BASE_PROFILES.forEach(profile => {
    merged.set(
      profileIdentityKey(profile),
      {
        ...profile
      }
    );
  });

  readLinkedProfiles().forEach(profile => {
    const key =
      profileIdentityKey(profile);

    const existing =
      merged.get(key);

    merged.set(
      key,
      {
        ...(existing || {}),
        ...profile,
        accountName:
          profile.accountName ||
          (existing &&
          existing.accountName) ||
          "Linked Account",
        accountSlug:
          profile.accountSlug ||
          (existing &&
          existing.accountSlug) ||
          null
      }
    );
  });

  return Array.from(
    merged.values()
  );
}

function invalidateDashboardState() {
  const properties =
    PropertiesService.getScriptProperties();

  const accountSlugs =
    readStringIndex(
      STATE_ACCOUNT_INDEX_KEY
    );

  accountSlugs.forEach(slug => {
    properties.deleteProperty(
      dashboardAccountPropertyKey(
        slug
      )
    );
  });

  properties.deleteProperty(
    STATE_ACCOUNT_INDEX_KEY
  );

  properties.deleteProperty(
    STATE_META_PROPERTY_KEY
  );

  properties.deleteProperty(
    STATE_PROPERTY_KEY
  );

  properties.deleteProperty(
    STATE_UPDATED_MS_KEY
  );

  properties.deleteProperty(
    STATE_REVISION_KEY
  );

  notePropertyWrite(
    accountSlugs.length + 5
  );
}

function isLikelyLinkedAccountToken(value) {
  const token =
    String(value || "").trim();

  return (
    token.length >= 12 &&
    token.length <= 512 &&
    /^[A-Za-z0-9+\/_=%.-]+$/.test(token)
  );
}

function findLinkedAccountToken(
  value,
  depth
) {
  const currentDepth =
    Number(depth || 0);

  if (
    value === null ||
    value === undefined ||
    currentDepth > 10
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    for (
      let index = 0;
      index < value.length;
      index++
    ) {
      const found =
        findLinkedAccountToken(
          value[index],
          currentDepth + 1
        );

      if (found) {
        return found;
      }
    }

    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  const preferredKeys = [
    "account_token",
    "accountToken",
    "content",
    "token",
    "value"
  ];

  for (
    let index = 0;
    index < preferredKeys.length;
    index++
  ) {
    const candidate =
      value[preferredKeys[index]];

    if (
      typeof candidate === "string" &&
      isLikelyLinkedAccountToken(
        candidate
      )
    ) {
      return candidate.trim();
    }
  }

  const wrapperKeys = [
    "data",
    "result",
    "payload",
    "response"
  ];

  for (
    let index = 0;
    index < wrapperKeys.length;
    index++
  ) {
    const key =
      wrapperKeys[index];

    if (
      Object.prototype.hasOwnProperty.call(
        value,
        key
      )
    ) {
      const found =
        findLinkedAccountToken(
          value[key],
          currentDepth + 1
        );

      if (found) {
        return found;
      }
    }
  }

  const keys =
    Object.keys(value);

  for (
    let index = 0;
    index < keys.length;
    index++
  ) {
    const found =
      findLinkedAccountToken(
        value[keys[index]],
        currentDepth + 1
      );

    if (found) {
      return found;
    }
  }

  return "";
}

function normalizeLinkedAccountToken(input) {
  let text =
    String(input || "")
      .replace(/^\uFEFF/, "")
      .trim();

  if (!text) {
    return "";
  }

  let parsed = null;

  try {
    parsed =
      JSON.parse(text);
  } catch (error) {
    parsed = null;
  }

  for (
    let attempt = 0;
    attempt < 3 &&
    typeof parsed === "string";
    attempt++
  ) {
    try {
      parsed =
        JSON.parse(
          parsed.trim()
        );
    } catch (error) {
      text =
        parsed.trim();
      parsed = null;
      break;
    }
  }

  if (
    parsed &&
    typeof parsed === "object"
  ) {
    const extracted =
      findLinkedAccountToken(
        parsed,
        0
      );

    return isLikelyLinkedAccountToken(
      extracted
    )
      ? extracted.trim()
      : "";
  }

  text =
    text
      .replace(/^["']|["']$/g, "")
      .trim();

  if (
    text.indexOf("{") === 0 ||
    text.indexOf("[") === 0
  ) {
    return "";
  }

  try {
    text =
      decodeURIComponent(text);
  } catch (error) {
    // Token tidak harus URI encoded.
  }

  return isLikelyLinkedAccountToken(
    text
  )
    ? text.trim()
    : "";
}

function safeParseApiJson(
  response,
  stageName
) {
  const httpCode =
    response.getResponseCode();

  const responseText =
    response.getContentText();

  try {
    return {
      httpCode:
        httpCode,
      body:
        JSON.parse(responseText)
    };
  } catch (error) {
    throw new Error(
      `${stageName} HTTP ${httpCode}: ` +
      "respons server bukan JSON yang valid."
    );
  }
}

function apiStatusValue(body) {
  if (!body || typeof body !== "object") {
    return null;
  }

  if (
    body.status !== undefined &&
    body.status !== null
  ) {
    return Number(body.status);
  }

  if (
    body.code !== undefined &&
    body.code !== null
  ) {
    return Number(body.code);
  }

  return null;
}

function apiErrorMessage(
  body,
  fallback
) {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  return (
    body.msg ||
    body.message ||
    body.error_description ||
    (
      body.error &&
      (
        body.error.message ||
        body.error.msg
      )
    ) ||
    fallback
  );
}

function testDashboardApiV30() {
  const result = {
    success: true,
    apiVersion:
      DASHBOARD_API_VERSION,
    actions:
      DASHBOARD_API_ACTIONS,
    deleteAccountHandler:
      typeof deleteLinkedAccount ===
      "function",
    deletePinConfigured:
      Boolean(
        getDeleteAccountPinHash()
      )
  };

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}

function sha256Hex(value) {
  const digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(value || ""),
      Utilities.Charset.UTF_8
    );

  return digest
    .map(byte => {
      const unsigned =
        byte < 0
          ? byte + 256
          : byte;

      return unsigned
        .toString(16)
        .padStart(2, "0");
    })
    .join("");
}

function getDeleteAccountPinHash() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        DELETE_PIN_HASH_PROPERTY_KEY
      ) ||
    DEFAULT_DELETE_PIN_SHA256
  );
}

function setDeleteAccountPin(pin) {
  const normalized =
    String(pin || "").trim();

  if (!/^\d{6}$/.test(normalized)) {
    throw new Error(
      "PIN hapus wajib terdiri dari 6 digit."
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      DELETE_PIN_HASH_PROPERTY_KEY,
      sha256Hex(normalized)
    );

  return {
    success: true,
    message:
      "PIN delete account berhasil diperbarui."
  };
}

function verifyDeleteAccountPin(pin) {
  const normalized =
    String(pin || "").trim();

  if (!/^\d{6}$/.test(normalized)) {
    return false;
  }

  return (
    sha256Hex(normalized) ===
    getDeleteAccountPinHash()
  );
}

function deleteLinkedAccount(
  accountSlug,
  pin
) {
  const slug =
    String(accountSlug || "")
      .trim()
      .toLowerCase();

  if (!verifyDeleteAccountPin(pin)) {
    return {
      success: false,
      message:
        "PIN verifikasi salah."
    };
  }

  if (
    !slug ||
    !/^[a-z0-9-]+$/.test(slug)
  ) {
    return {
      success: false,
      message:
        "Slug akun tidak valid."
    };
  }

  const linkedProfiles =
    readLinkedProfiles();

  const targetIndex =
    linkedProfiles.findIndex(profile =>
      profileStorageSlug(profile) === slug
    );

  if (targetIndex < 0) {
    return {
      success: false,
      message:
        "Akun tidak ditemukan atau merupakan akun bawaan."
    };
  }

  const target =
    linkedProfiles[targetIndex];

  linkedProfiles.splice(
    targetIndex,
    1
  );

  saveLinkedProfiles(
    linkedProfiles
  );

  invalidateDashboardState();

  const state =
    getDashboardState(
      true,
      "account-deleted"
    );

  return {
    success: true,
    deletedAccount: {
      slug:
        slug,
      name:
        target.accountName ||
        "Linked Account",
      uid:
        String(target.id || "")
    },
    state:
      state
  };
}

function addLinkedAccount(accountToken) {
  const token =
    normalizeLinkedAccountToken(
      accountToken
    );

  if (!token) {
    return {
      success: false,
      message:
        "Format account_token tidak valid."
    };
  }

  try {
    const auth =
      performOAuthFlow(token);

    const player =
      getPlayerProfile(
        auth.cred,
        auth.salt,
        {
          id: "",
          server: "",
          language: "en",
          accountName:
            "Linked Account"
        }
      );

    if (
      !player ||
      !player.success ||
      !player.roleId ||
      !player.serverId
    ) {
      throw new Error(
        player &&
        player.error
          ? player.error
          : "Role Endfield tidak ditemukan."
      );
    }

    const roleId =
      String(player.roleId);

    const serverId =
      String(player.serverId);

    const accountName =
      String(
        player.nickname ||
        `Account ${roleId.slice(-4)}`
      );

    const baseMatch =
      BASE_PROFILES.find(profile =>
        String(profile.id) === roleId &&
        String(profile.server) === serverId
      );

    const linkedProfiles =
      readLinkedProfiles();

    const existingIndex =
      linkedProfiles.findIndex(profile =>
        String(profile.id) === roleId &&
        String(profile.server) === serverId
      );

    const existing =
      existingIndex >= 0
        ? linkedProfiles[existingIndex]
        : null;

    const accountSlug =
      baseMatch
        ? profileStorageSlug(baseMatch)
        : (
            existing &&
            existing.accountSlug
              ? existing.accountSlug
              : (
                  slugifyAccountName(
                    accountName
                  ) +
                  "-" +
                  roleId.slice(-4)
                )
          );

    const linkedProfile = {
      account_token:
        token,
      id:
        roleId,
      server:
        serverId,
      language:
        "en",
      accountName:
        accountName,
      accountSlug:
        accountSlug,
      linkedAt:
        existing &&
        existing.linkedAt
          ? existing.linkedAt
          : new Date().toISOString(),
      updatedAt:
        new Date().toISOString()
    };

    let updated = false;

    if (existingIndex >= 0) {
      linkedProfiles[existingIndex] =
        linkedProfile;
      updated = true;
    } else {
      if (
        linkedProfiles.length >=
        MAX_LINKED_ACCOUNTS
      ) {
        return {
          success: false,
          message:
            `Maksimal ${MAX_LINKED_ACCOUNTS} akun tertaut.`
        };
      }

      linkedProfiles.push(
        linkedProfile
      );
    }

    saveLinkedProfiles(
      linkedProfiles
    );

    invalidateDashboardState();

    const state =
      getDashboardState(
        true,
        "account-linked"
      );

    return {
      success: true,
      updated:
        updated ||
        Boolean(baseMatch),
      account: {
        slug:
          accountSlug,
        name:
          accountName,
        uid:
          roleId,
        serverId:
          serverId,
        serverName:
          player.serverName || ""
      },
      state:
        state
    };
  } catch (error) {
    return {
      success: false,
      message:
        error &&
        error.message
          ? error.message
          : String(error)
    };
  }
}

// ============================================================
// REALTIME DASHBOARD STATE
// ============================================================

function getDashboardState(forceSync, reason) {
  const stored = readStoredDashboardState();
  const updatedMs = Number(
    PropertiesService
      .getScriptProperties()
      .getProperty(STATE_UPDATED_MS_KEY) || 0
  );

  const isFresh =
    stored &&
    Date.now() - updatedMs < STATE_MAX_AGE_MS;

  if (!forceSync && isFresh) {
    return stateWithCurrentPreferences(stored);
  }

  return syncDashboardState(
    Boolean(forceSync),
    reason || "unknown"
  );
}

function syncDashboardState(forceSync, reason) {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(5000)) {
    const existing =
      readStoredDashboardState();

    if (existing) {
      existing.sync_in_progress = true;
      return existing;
    }

    throw new Error(
      "Sinkronisasi lain sedang berjalan. Coba lagi beberapa detik."
    );
  }

  try {
    const scriptProperties =
      PropertiesService.getScriptProperties();

    const previous =
      readStoredDashboardState() ||
      createInitialDashboardState();

    const updatedMs = Number(
      scriptProperties.getProperty(
        STATE_UPDATED_MS_KEY
      ) || 0
    );

    if (
      !forceSync &&
      Date.now() - updatedMs < STATE_MAX_AGE_MS
    ) {
      return previous;
    }

    const accounts = {};
    const accountProfiles = getAllProfiles().sort((first, second) => {
      const firstPref = preferenceForSlug(profileStorageSlug(first));
      const secondPref = preferenceForSlug(profileStorageSlug(second));
      if (firstPref.primary !== secondPref.primary) return firstPref.primary ? -1 : 1;
      return firstPref.order - secondPref.order;
    });
    if (accountProfiles.length > 1) {
      const rotation = Number(previous.revision || 0) % accountProfiles.length;
      accountProfiles.push(...accountProfiles.splice(0, rotation));
    }

    accountProfiles.forEach(
      (profile, index) => {
        const slug =
          profileStorageSlug(
            profile
          );

        const oldAccount =
          previous.accounts &&
          previous.accounts[slug]
            ? previous.accounts[slug]
            : null;

        accounts[slug] =
          fetchDashboardAccount(
            profile,
            oldAccount
          );

        if (
          index <
          accountProfiles.length - 1
        ) {
          Utilities.sleep(650);
        }
      }
    );

    const revision =
      Number(
        scriptProperties.getProperty(
          STATE_REVISION_KEY
        ) || 0
      ) + 1;

    const dashboardState = {
      updated_at: new Date().toISOString(),
      checked_at: new Date().toISOString(),
      revision: revision,
      reason: reason || "unknown",
      accounts: accounts
    };

    writeStoredDashboardState(
      dashboardState
    );

    scriptProperties.setProperties({
      [STATE_UPDATED_MS_KEY]:
        String(Date.now()),
      [STATE_REVISION_KEY]:
        String(revision)
    });

    notePropertyWrite(2);

    recordDashboardHistory(dashboardState, true);
    generatePushEventsFromState(dashboardState);
    return dashboardState;
  } catch (error) {
    const existing = readStoredDashboardState();
    recordDashboardHistory(existing || createInitialDashboardState(), false);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function syncDashboardAccount(accountSlug, reason) {
  const slug = String(accountSlug || "").trim().toLowerCase();
  const profile = getAllProfiles().find(item => profileStorageSlug(item) === slug);
  if (!profile) throw new Error("Akun tidak ditemukan.");
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error("Sinkronisasi lain sedang berjalan.");
  try {
    const properties = PropertiesService.getScriptProperties();
    const previous = readStoredDashboardState() || createInitialDashboardState();
    const oldAccount = previous.accounts?.[slug] || null;
    previous.accounts[slug] = fetchDashboardAccount(profile, oldAccount);
    previous.accounts[slug].settings = preferenceForSlug(slug);
    previous.accounts[slug].display_name = previous.accounts[slug].settings.displayName || previous.accounts[slug].display_name || null;
    previous.updated_at = new Date().toISOString();
    previous.checked_at = previous.updated_at;
    previous.reason = reason || "single-account";
    previous.revision = Number(previous.revision || 0) + 1;
    writeStoredDashboardState(
      previous
    );

    properties.setProperties({
      [STATE_UPDATED_MS_KEY]:
        String(Date.now()),
      [STATE_REVISION_KEY]:
        String(previous.revision)
    });

    notePropertyWrite(2);
    recordDashboardHistory(previous, true);
    generatePushEventsFromState(previous);
    return previous;
  } catch (error) {
    recordDashboardHistory(readStoredDashboardState() || createInitialDashboardState(), false);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function dashboardAccountPropertyKey(
  slug
) {
  return (
    STATE_ACCOUNT_PREFIX +
    String(slug || "account")
      .replace(
        /[^a-z0-9_-]/gi,
        "-"
      )
      .slice(0, 80)
  );
}

function utf8ByteLength(value) {
  return Utilities
    .newBlob(
      String(value || "")
    )
    .getBytes()
    .length;
}

function assertSafePropertyValue(
  key,
  value
) {
  const bytes =
    utf8ByteLength(value);

  if (
    bytes >
    SCRIPT_PROPERTY_SAFE_BYTES
  ) {
    throw new Error(
      `Script Property ${key} terlalu besar (${bytes} bytes).`
    );
  }
}

function writeStoredDashboardState(
  state
) {
  if (
    !state ||
    typeof state !== "object"
  ) {
    throw new Error(
      "Dashboard state tidak valid."
    );
  }

  const properties =
    PropertiesService
      .getScriptProperties();

  const accounts =
    state.accounts &&
    typeof state.accounts === "object"
      ? state.accounts
      : {};

  const slugs =
    Object.keys(accounts);

  const oldSlugs =
    readStringIndex(
      STATE_ACCOUNT_INDEX_KEY
    );

  const writes = {};

  slugs.forEach(slug => {
    const key =
      dashboardAccountPropertyKey(
        slug
      );

    const payload =
      JSON.stringify(
        accounts[slug]
      );

    assertSafePropertyValue(
      key,
      payload
    );

    writes[key] =
      payload;
  });

  const meta = {
    ...state,
    accounts:
      undefined,
    account_slugs:
      slugs
  };

  delete meta.accounts;

  const metaPayload =
    JSON.stringify(meta);

  const indexPayload =
    JSON.stringify(slugs);

  assertSafePropertyValue(
    STATE_META_PROPERTY_KEY,
    metaPayload
  );

  assertSafePropertyValue(
    STATE_ACCOUNT_INDEX_KEY,
    indexPayload
  );

  writes[
    STATE_META_PROPERTY_KEY
  ] = metaPayload;

  writes[
    STATE_ACCOUNT_INDEX_KEY
  ] = indexPayload;

  properties.setProperties(
    writes
  );

  notePropertyWrite(
    Object.keys(writes).length
  );

  const current =
    new Set(slugs);

  oldSlugs.forEach(slug => {
    if (current.has(slug)) {
      return;
    }

    properties.deleteProperty(
      dashboardAccountPropertyKey(
        slug
      )
    );

    notePropertyWrite(1);
  });

  if (
    properties.getProperty(
      STATE_PROPERTY_KEY
    )
  ) {
    properties.deleteProperty(
      STATE_PROPERTY_KEY
    );

    notePropertyWrite(1);
  }
}

function readStoredDashboardState() {
  const properties =
    PropertiesService
      .getScriptProperties();

  const meta =
    parseJsonValue(
      properties.getProperty(
        STATE_META_PROPERTY_KEY
      ),
      null
    );

  const slugs =
    readStringIndex(
      STATE_ACCOUNT_INDEX_KEY
    );

  if (
    meta &&
    typeof meta === "object"
  ) {
    const accounts = {};

    slugs.forEach(slug => {
      const account =
        parseJsonValue(
          properties.getProperty(
            dashboardAccountPropertyKey(
              slug
            )
          ),
          null
        );

      if (account) {
        accounts[slug] =
          account;
      }
    });

    if (
      Object.keys(accounts).length ===
        slugs.length
    ) {
      const state = {
        ...meta,
        accounts:
          accounts
      };

      delete state.account_slugs;

      return state;
    }
  }

  const legacyRaw =
    properties.getProperty(
      STATE_PROPERTY_KEY
    );

  if (!legacyRaw) {
    return null;
  }

  try {
    const legacy =
      JSON.parse(legacyRaw);

    if (
      legacy &&
      legacy.accounts
    ) {
      try {
        writeStoredDashboardState(
          legacy
        );
      } catch (_) {}

      return legacy;
    }
  } catch (_) {}

  return null;
}

function createInitialDashboardState() {
  const accounts = {};

  getAllProfiles().forEach(profile => {
    const slug =
      profileStorageSlug(
        profile
      );

    accounts[slug] =
      createFallbackDashboardAccount(
        profile,
        null
      );
  });

  return {
    updated_at: null,
    checked_at: null,
    revision: 0,
    reason: "initial",
    accounts: accounts
  };
}

function createFallbackDashboardAccount(
  profile,
  previous
) {
  const previousProfile =
    previous && previous.profile
      ? previous.profile
      : null;

  const previousLive =
    previous && previous.live
      ? previous.live
      : null;

  const slug = profileStorageSlug(profile);
  const preferences = preferenceForSlug(slug);

  return {
    slug: slug,
    display_name:
      preferences.displayName ||
      (previous && previous.display_name ? previous.display_name : null),
    settings:
      preferences,
    uid:
      previous &&
      previous.uid
        ? previous.uid
        : null,
    server_name:
      previous &&
      previous.server_name
        ? previous.server_name
        : null,
    profile:
      previousProfile,
    live:
      previousLive,
    profile_updated_at:
      previous &&
      previous.profile_updated_at
        ? previous.profile_updated_at
        : null,
    live_updated_at:
      previous &&
      previous.live_updated_at
        ? previous.live_updated_at
        : null,
    profile_available:
      Boolean(previousProfile),
    live_available:
      Boolean(previousLive),
    profile_stale:
      Boolean(previousProfile),
    live_stale:
      Boolean(previousLive),
    errors: []
  };
}

function fetchDashboardAccount(
  profile,
  previous
) {
  const result =
    createFallbackDashboardAccount(
      profile,
      previous
    );

  try {
    let auth =
      performOAuthFlowCached(
        profile,
        false
      );

    let detailResult =
      getCardDetail(
        auth.cred,
        auth.salt,
        profile
      );

    if (detailResult.authExpired) {
      clearCachedOAuth(profile);

      auth =
        performOAuthFlowCached(
          profile,
          true
        );

      detailResult =
        getCardDetail(
          auth.cred,
          auth.salt,
          profile
        );
    }

    if (!detailResult.success) {
      throw new Error(
        detailResult.error ||
        "Card detail tidak tersedia."
      );
    }

    /*
     * Nama, UID, level dan server untuk dashboard diambil dari API
     * Player Binding. Tidak memakai accountName/id/server statis sebagai
     * tampilan sebelum API berhasil.
     */
    const bindingProfile =
      getPlayerProfileCached(
        auth.cred,
        auth.salt,
        profile
      );

    const detail =
      detailResult.detail || {};

    const base =
      detail.base || {};

    const dungeon =
      detail.dungeon || {};

    const daily =
      detail.dailyMission || {};

    const weekly =
      detail.weeklyMission || {};

    const battlePass =
      detail.bpSystem || {};

    const apiNickname =
      firstDefined(
        base.name,
        bindingProfile &&
        bindingProfile.success
          ? bindingProfile.nickname
          : null
      );

    const apiUid =
      firstDefined(
        bindingProfile &&
        bindingProfile.success
          ? bindingProfile.roleId
          : null,
        base.roleId,
        base.uid,
        base.id,
        detail.roleId,
        detail.uid
      );

    const apiServerName =
      firstDefined(
        bindingProfile &&
        bindingProfile.success
          ? bindingProfile.serverName
          : null,
        base.serverName,
        detail.serverName
      );

    const apiLevel =
      firstDefined(
        base.level,
        bindingProfile &&
        bindingProfile.success
          ? bindingProfile.level
          : null
      );

    result.display_name =
      apiNickname
        ? String(apiNickname)
        : null;

    result.uid =
      apiUid
        ? String(apiUid)
        : null;

    result.server_name =
      apiServerName
        ? String(apiServerName)
        : null;

    result.profile = {
      uid:
        apiUid
          ? String(apiUid)
          : null,
      name:
        apiNickname
          ? String(apiNickname)
          : null,
      avatar_url:
        firstDefined(
          bindingProfile &&
          bindingProfile.success
            ? bindingProfile.avatarUrl
            : null,
          findProfileImageUrl(base),
          findProfileImageUrl(detail)
        ) || "",
      level:
        toNullableNumber(
          apiLevel
        ),
      exploration_level:
        toNullableNumber(
          firstDefined(
            base.worldLevel,
            base.explorationLevel
          )
        ),
      operator_count:
        toNullableNumber(
          firstDefined(
            base.charNum,
            base.characterNum
          )
        )
    };

    if (
      !bindingProfile ||
      !bindingProfile.success
    ) {
      result.errors.push(
        "Player Binding belum memberikan nama/UID/server lengkap."
      );
    }

    const currentSanity =
      toNullableNumber(
        dungeon.curStamina
      );

    const maxSanity =
      toNullableNumber(
        dungeon.maxStamina
      );

    const maxTimestamp =
      toNullableNumber(
        dungeon.maxTs
      );

    result.live = {
      sanity: {
        current:
          currentSanity,
        max:
          maxSanity,
        full_recover_at:
          maxTimestamp
            ? new Date(
                maxTimestamp * 1000
              ).toISOString()
            : null
      },
      daily_activity: {
        current:
          toNullableNumber(
            daily.dailyActivation
          ),
        max:
          toNullableNumber(
            daily.maxDailyActivation
          )
      },
      weekly_routine: {
        current:
          toNullableNumber(
            firstDefined(
              weekly.score,
              weekly.current,
              weekly.weeklyActivation
            )
          ),
        max:
          toNullableNumber(
            firstDefined(
              weekly.total,
              weekly.max,
              weekly.maxWeeklyActivation
            )
          )
      },
      protocol_pass: {
        current:
          toNullableNumber(
            battlePass.curLevel
          ),
        max:
          toNullableNumber(
            battlePass.maxLevel
          )
      }
    };

    const successfulSyncAt =
      new Date().toISOString();

    result.profile_available = true;
    result.live_available = true;
    result.profile_stale = false;
    result.live_stale = false;
    result.profile_updated_at =
      successfulSyncAt;
    result.live_updated_at =
      successfulSyncAt;
  } catch (error) {
    result.errors = [
      error && error.message
        ? error.message
        : String(error)
    ];
  }

  return result;
}

function getCardDetail(
  cred,
  salt,
  profile
) {
  const path =
    "/api/v1/game/endfield/card/detail";

  const timestamp =
    String(
      Math.floor(Date.now() / 1000)
    );

  const headers = {
    ...headerDict.default,
    cred: cred,
    "sk-game-role":
      `3_${profile.id}_${profile.server}`,
    "sk-language":
      profile.language || "en",
    timestamp: timestamp
  };

  headers.sign = generateSign(
    path,
    "GET",
    headers,
    "",
    "",
    salt
  );

  const response =
    trackedFetch(
      urlDict.CardDetail,
      {
        method: "get",
        headers: headers,
        muteHttpExceptions: true
      }
    );

  const responseCode =
    response.getResponseCode();

  const responseText =
    response.getContentText();

  let responseJson;

  try {
    responseJson =
      JSON.parse(responseText);
  } catch (error) {
    return {
      success: false,
      authExpired: false,
      error:
        `Card detail bukan JSON. HTTP ${responseCode}`
    };
  }

  const authExpired =
    responseCode === 401 ||
    responseCode === 403 ||
    Number(responseJson.code) === 10000;

  if (authExpired) {
    return {
      success: false,
      authExpired: true,
      error:
        responseJson.message ||
        responseJson.msg ||
        "Credential kedaluwarsa."
    };
  }

  const detail =
    responseJson &&
    responseJson.data
      ? responseJson.data.detail
      : null;

  if (
    responseCode < 200 ||
    responseCode >= 300 ||
    Number(responseJson.code) !== 0 ||
    !detail
  ) {
    return {
      success: false,
      authExpired: false,
      error:
        responseJson.message ||
        responseJson.msg ||
        `Card detail gagal. HTTP ${responseCode}`
    };
  }

  return {
    success: true,
    authExpired: false,
    detail: detail
  };
}

function findProfileImageUrl(value) {
  const preferredKeys = [
    "avatarUrl",
    "avatar_url",
    "avatar",
    "headIcon",
    "head_icon",
    "headUrl",
    "head_url",
    "portraitUrl",
    "portrait_url",
    "iconUrl",
    "icon_url",
    "imageUrl",
    "image_url"
  ];

  if (
    !value ||
    typeof value !== "object"
  ) {
    return "";
  }

  for (
    let index = 0;
    index < preferredKeys.length;
    index++
  ) {
    const key = preferredKeys[index];
    const candidate = value[key];

    const directUrl =
      normalizeImageUrl(candidate);

    if (directUrl) {
      return directUrl;
    }

    if (
      candidate &&
      typeof candidate === "object"
    ) {
      const nested =
        findProfileImageUrl(candidate);

      if (nested) {
        return nested;
      }
    }
  }

  const keys = Object.keys(value);

  for (
    let index = 0;
    index < keys.length;
    index++
  ) {
    const key = keys[index];

    if (
      !/avatar|portrait|head|profile|businesscard/i.test(key)
    ) {
      continue;
    }

    const candidate = value[key];
    const directUrl =
      normalizeImageUrl(candidate);

    if (directUrl) {
      return directUrl;
    }

    if (
      candidate &&
      typeof candidate === "object"
    ) {
      const nested =
        findProfileImageUrl(candidate);

      if (nested) {
        return nested;
      }
    }
  }

  return "";
}

function normalizeImageUrl(value) {
  if (typeof value !== "string") {
    return "";
  }

  const text = value.trim();

  if (
    /^https?:\/\/.+/i.test(text)
  ) {
    return text;
  }

  if (
    /^\/\/.+/.test(text)
  ) {
    return `https:${text}`;
  }

  return "";
}

function firstDefined() {
  for (
    let index = 0;
    index < arguments.length;
    index++
  ) {
    const value = arguments[index];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function toNullableNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function slugifyAccountName(value) {
  return String(value || "account")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// OAUTH & SIGNATURE
// ============================================================

function performOAuthFlowCached(
  profile,
  forceRefresh
) {
  const cache =
    CacheService.getScriptCache();

  const cacheKey =
    `AUTH_V3_${slugifyAccountName(
      profile.accountName
    )}`;

  if (!forceRefresh) {
    const cached =
      cache.get(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        cache.remove(cacheKey);
      }
    }
  }

  const auth =
    performOAuthFlow(
      profile.account_token
    );

  cache.put(
    cacheKey,
    JSON.stringify(auth),
    AUTH_CACHE_SECONDS
  );

  return auth;
}

function clearCachedOAuth(profile) {
  CacheService
    .getScriptCache()
    .remove(
      `AUTH_V3_${slugifyAccountName(
        profile.accountName
      )}`
    );
}

function performOAuthFlow(accountToken) {
  const infoUrl =
    "https://as.gryphline.com/user/info/v1/basic" +
    `?token=${encodeURIComponent(accountToken)}`;

  const infoRes =
    trackedFetch(
      infoUrl,
      {
        headers: {
          "Accept":
            "application/json",
          "User-Agent":
            "Mozilla/5.0 Endfield-Dashboard/1.0"
        },
        muteHttpExceptions: true
      }
    );

  const infoResult =
    safeParseApiJson(
      infoRes,
      "OAuth T1"
    );

  const infoData =
    infoResult.body;

  const infoStatus =
    apiStatusValue(
      infoData
    );

  if (
    infoResult.httpCode < 200 ||
    infoResult.httpCode >= 300 ||
    infoStatus !== 0
  ) {
    throw new Error(
      `OAuth T1 HTTP ${infoResult.httpCode}: ` +
      apiErrorMessage(
        infoData,
        "account_token ditolak atau sudah tidak berlaku."
      )
    );
  }

  const grantRes =
    trackedFetch(
      "https://as.gryphline.com/user/oauth2/v2/grant",
      {
        method: "post",
        contentType:
          "application/json",
        payload:
          JSON.stringify({
            token: accountToken,
            appCode: APP_CODE,
            type: 0
          }),
        muteHttpExceptions: true
      }
    );

  const grantData =
    JSON.parse(
      grantRes.getContentText()
    );

  if (
    grantData.status !== 0 ||
    !grantData.data ||
    !grantData.data.code
  ) {
    throw new Error(
      "OAuth T2: " +
      apiErrorMessage(
        grantData,
        "Gagal membuat authorization grant."
      )
    );
  }

  const credRes =
    trackedFetch(
      `${BASE_URL}/user/auth/generate_cred_by_code`,
      {
        method: "post",
        contentType:
          "application/json",
        headers: {
          "platform": "3"
        },
        payload:
          JSON.stringify({
            code:
              grantData.data.code,
            kind: 1
          }),
        muteHttpExceptions: true
      }
    );

  const credData =
    JSON.parse(
      credRes.getContentText()
    );

  if (
    credData.code !== 0 ||
    !credData.data ||
    !credData.data.cred
  ) {
    throw new Error(
      `OAuth T3: ${credData.message}`
    );
  }

  return {
    cred: credData.data.cred,
    salt: credData.data.token
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(byte =>
      (
        byte < 0
          ? byte + 256
          : byte
      )
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

function generateSign(
  path,
  method,
  headers,
  query,
  body,
  token
) {
  let stringToSign =
    path +
    (
      method === "GET"
        ? (query || "")
        : (body || "")
    );

  if (headers.timestamp) {
    stringToSign +=
      headers.timestamp.toString();
  }

  const headerObject = {};

  [
    "platform",
    "timestamp",
    "dId",
    "vName"
  ].forEach(key => {
    if (headers[key]) {
      headerObject[key] =
        headers[key];
    } else if (key === "dId") {
      headerObject[key] = "";
    }
  });

  stringToSign +=
    JSON.stringify(headerObject);

  const hmacHex =
    bytesToHex(
      Utilities
        .computeHmacSha256Signature(
          stringToSign,
          token
        )
    );

  return bytesToHex(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      hmacHex,
      Utilities.Charset.UTF_8
    )
  );
}

// ============================================================
// PLAYER BINDING TEST
// ============================================================

function testPlayerLevels() {
  const output =
    getAllProfiles().map(profile => {
      try {
        const auth =
          performOAuthFlowCached(
            profile,
            true
          );

        const player =
          getPlayerProfile(
            auth.cred,
            auth.salt,
            profile
          );

        return {
          accountName:
            profile.accountName,
          gameNickname:
            player.nickname,
          level:
            player.level,
          roleId:
            player.roleId,
          serverId:
            player.serverId,
          serverName:
            player.serverName,
          success:
            player.success,
          error:
            player.error || null
        };
      } catch (error) {
        return {
          accountName:
            profile.accountName,
          gameNickname:
            profile.accountName,
          level: null,
          success: false,
          error:
            error && error.message
              ? error.message
              : String(error)
        };
      }
    });

  console.log(
    JSON.stringify(
      output,
      null,
      2
    )
  );

  return output;
}

function getPlayerProfileCached(
  cred,
  salt,
  profile
) {
  const cache =
    CacheService.getScriptCache();

  const cacheKey =
    `PLAYER_BINDING_V1_${slugifyAccountName(
      profile.accountName
    )}`;

  const cached =
    cache.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      cache.remove(cacheKey);
    }
  }

  const playerProfile =
    getPlayerProfile(
      cred,
      salt,
      profile
    );

  /*
   * Hanya cache respons yang sukses. Jika gagal, request berikutnya
   * tetap boleh mencoba lagi tanpa menunggu cache kedaluwarsa.
   */
  if (
    playerProfile &&
    playerProfile.success
  ) {
    cache.put(
      cacheKey,
      JSON.stringify(playerProfile),
      PLAYER_BINDING_CACHE_SECONDS
    );
  }

  return playerProfile;
}

function getPlayerProfile(
  cred,
  salt,
  profile
) {
  const path =
    "/api/v1/game/player/binding";

  const timestamp =
    String(
      Math.floor(Date.now() / 1000)
    );

  const headers = {
    ...headerDict.default,
    cred: cred,
    "sk-language":
      profile.language || "en",
    timestamp: timestamp
  };

  headers.sign =
    generateSign(
      path,
      "GET",
      headers,
      "",
      "",
      salt
    );

  try {
    const response =
      trackedFetch(
        urlDict.PlayerBinding,
        {
          method: "get",
          headers: headers,
          muteHttpExceptions: true
        }
      );

    const responseCode =
      response.getResponseCode();

    const responseText =
      response.getContentText();

    if (
      responseCode < 200 ||
      responseCode >= 300
    ) {
      throw new Error(
        `Player binding HTTP ${responseCode}`
      );
    }

    const responseJson =
      JSON.parse(responseText);

    if (responseJson.code !== 0) {
      throw new Error(
        responseJson.message ||
        responseJson.msg ||
        "Player binding gagal"
      );
    }

    const appList =
      responseJson.data &&
      Array.isArray(
        responseJson.data.list
      )
        ? responseJson.data.list
        : [];

    const endfieldApp =
      appList.find(app =>
        app &&
        app.appCode === "endfield"
      );

    const bindingList =
      endfieldApp &&
      Array.isArray(
        endfieldApp.bindingList
      )
        ? endfieldApp.bindingList
        : [];

    const roles = [];

    bindingList.forEach(binding => {
      if (
        binding &&
        Array.isArray(binding.roles)
      ) {
        roles.push(
          ...binding.roles
        );
      }

      if (
        binding &&
        binding.defaultRole
      ) {
        roles.push(
          binding.defaultRole
        );
      }
    });

    const matchedRole =
      roles.find(role =>
        role &&
        String(role.roleId) ===
          String(profile.id) &&
        String(role.serverId) ===
          String(profile.server)
      ) ||
      roles.find(role =>
        role &&
        String(role.roleId) ===
          String(profile.id)
      ) ||
      roles[0];

    if (!matchedRole) {
      throw new Error(
        "Role Endfield tidak ditemukan pada player binding"
      );
    }

    const parsedLevel =
      Number(matchedRole.level);

    return {
      success: true,
      nickname:
        String(
          matchedRole.nickname ||
          matchedRole.nickName ||
          profile.accountName ||
          "Unknown"
        ),
      level:
        Number.isFinite(parsedLevel)
          ? parsedLevel
          : null,
      roleId:
        String(
          matchedRole.roleId ||
          profile.id ||
          ""
        ),
      serverId:
        String(
          matchedRole.serverId ||
          profile.server ||
          ""
        ),
      serverName:
        String(
          matchedRole.serverName ||
          ""
        ),
      avatarUrl:
        findProfileImageUrl(
          matchedRole
        )
    };
  } catch (error) {
    return {
      success: false,
      nickname:
        profile.accountName,
      level: null,
      roleId:
        String(profile.id || ""),
      serverId:
        String(profile.server || ""),
      serverName: "",
      avatarUrl: "",
      error:
        error && error.message
          ? error.message
          : String(error)
    };
  }
}

// ============================================================
// CHECK-IN
// ============================================================

function main() {
  const accountProfiles =
    getAllProfiles();

  try {
    const results = [];

    for (
      let index = 0;
      index < accountProfiles.length;
      index++
    ) {
      results.push(
        autoSignFunction(
          accountProfiles[index]
        )
      );

      if (
        index <
        accountProfiles.length - 1
      ) {
        Utilities.sleep(3000);
      }
    }

    recordCheckinHistory(results);

    let discordStatus = {
      enabled: false,
      success: null,
      statusCode: null
    };

    if (
      discord_notify &&
      discordWebhook
    ) {
      try {
        discordStatus = {
          enabled: true,
          ...postWebhook(results)
        };
      } catch (discordError) {
        discordStatus = {
          enabled: true,
          success: false,
          statusCode: null,
          message:
            discordError &&
            discordError.message
              ? discordError.message
              : String(discordError)
        };
      }
    }

    let dashboardState = null;

    try {
      dashboardState =
        getDashboardState(
          true,
          "after-checkin"
        );
    } catch (syncError) {
      console.error(
        "Sinkron setelah check-in gagal:",
        syncError
      );
    }

    return {
      success: true,
      totalAccounts:
        accountProfiles.length,
      data:
        results,
      discord:
        discordStatus,
      state:
        dashboardState
    };
  } catch (error) {
    return {
      success: false,
      totalAccounts:
        accountProfiles.length,
      data: [],
      message:
        error && error.message
          ? error.message
          : String(error)
    };
  }
}

function discordPing() {
  return myDiscordID
    ? `<@${myDiscordID}>`
    : "";
}

function autoSignFunction({
  account_token,
  id,
  server,
  language = "en",
  accountName
}) {
  let statusMsg = "";
  let isError = true;

  let playerProfile = {
    success: false,
    nickname: accountName,
    level: null,
    roleId: String(id || ""),
    serverId: String(server || ""),
    serverName: ""
  };

  const maxRetries = 3;

  for (
    let attempt = 1;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      const profileConfig = {
        account_token:
          account_token,
        id:
          id,
        server:
          server,
        language:
          language,
        accountName:
          accountName
      };

      const auth =
        performOAuthFlowCached(
          profileConfig,
          false
        );

      playerProfile =
        getPlayerProfile(
          auth.cred,
          auth.salt,
          profileConfig
        );

      const path =
        "/web/v1/game/endfield/attendance";

      const timestamp =
        String(
          Math.floor(Date.now() / 1000)
        );

      const headers = {
        ...headerDict.default,
        cred: auth.cred,
        "sk-game-role":
          `3_${id}_${server}`,
        "sk-language":
          language,
        timestamp:
          timestamp
      };

      headers.sign =
        generateSign(
          path,
          "POST",
          headers,
          "",
          "",
          auth.salt
        );

      const httpResponse =
        trackedFetch(
          urlDict.Endfield,
          {
            method: "post",
            headers: headers,
            muteHttpExceptions: true
          }
        );

      const responseCode =
        httpResponse.getResponseCode();

      const responseText =
        httpResponse.getContentText();

      if (responseCode >= 500) {
        throw new Error(
          `Server sibuk (Error ${responseCode}).`
        );
      }

      let responseJson;

      try {
        responseJson =
          JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          "Respons server gagal dibaca " +
          `(Bukan JSON). Code: ${responseCode}`
        );
      }

      if (
        responseJson.code === 10000
      ) {
        clearCachedOAuth(
          profileConfig
        );

        isError = true;
        statusMsg =
          "⚠️ **Token kedaluwarsa/Invalid!** " +
          "Cek kembali `account_token`.";

        break;
      }

      const serverMessage =
        String(
          responseJson.message ||
          responseJson.msg ||
          "Respons tidak dikenal"
        );

      const normalizedMessage =
        serverMessage.toLowerCase();

      if (serverMessage === "OK") {
        isError = false;
        statusMsg =
          "✅ **Berhasil check-in!**";
        break;
      }

      if (
        normalizedMessage.includes(
          "please do not sign in again"
        ) ||
        normalizedMessage.includes(
          "has already signed in"
        )
      ) {
        isError = false;
        statusMsg =
          "☑️ **Sudah pernah check-in hari ini!**";
        break;
      }

      isError = true;
      statusMsg =
        `❌ **Gagal:** ${serverMessage}`;
      break;
    } catch (error) {
      if (attempt === maxRetries) {
        statusMsg =
          "❌ **Gagal " +
          `(setelah ${maxRetries}x coba):** ` +
          `${error.message}`;

        isError = true;
      } else {
        Utilities.sleep(5000);
      }
    }
  }

  return {
    accountName:
      accountName,
    gameNickname:
      playerProfile.nickname ||
      accountName,
    accountLevel:
      playerProfile.level,
    profileFetched:
      Boolean(playerProfile.success),
    profileError:
      playerProfile.error || null,
    roleId:
      playerProfile.roleId ||
      String(id || ""),
    serverId:
      playerProfile.serverId ||
      String(server || ""),
    serverName:
      playerProfile.serverName || "",
    statusMsg:
      statusMsg,
    isError:
      isError
  };
}

// ============================================================
// DISCORD
// ============================================================

function stripDiscordFormatting(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(
      /✅|☑️|☑|⚠️|⚠|❌|🚨/g,
      ""
    )
    .trim();
}

function truncateDiscordText(
  text,
  maxLength
) {
  const value =
    String(text || "");

  if (
    value.length <= maxLength
  ) {
    return value;
  }

  return (
    value
      .substring(
        0,
        Math.max(
          0,
          maxLength - 1
        )
      )
      .trim() +
    "…"
  );
}

function classifyCheckInResult(result) {
  const rawMessage =
    String(result.statusMsg || "");

  const normalized =
    rawMessage.toLowerCase();

  if (result.isError) {
    return {
      key: "error",
      emoji: "❌",
      label:
        "Gagal check-in",
      detail:
        stripDiscordFormatting(
          rawMessage
        ) ||
        "Terjadi kendala saat check-in."
    };
  }

  if (
    normalized.includes(
      "sudah pernah"
    ) ||
    normalized.includes(
      "already signed"
    ) ||
    normalized.includes(
      "do not sign in again"
    )
  ) {
    return {
      key: "already",
      emoji: "☑️",
      label:
        "Sudah check-in",
      detail:
        "Hadiah hari ini sebelumnya sudah diklaim."
    };
  }

  return {
    key: "success",
    emoji: "✅",
    label:
      "Berhasil check-in",
    detail:
      "Hadiah harian berhasil diklaim."
  };
}

function getServerDisplay(result) {
  const serverName =
    String(
      result.serverName || ""
    ).trim();

  return (
    serverName ||
    "Tidak diketahui"
  );
}

function postWebhook(results) {
  const ENDFIELD_ICON =
    "https://cdn2.cdnstep.com/uZonBNFhuQtCPjNRKuWd/cover-2.thumb256.png";

  const ERROR_ICON =
    "https://cdn2.cdnstep.com/2eEzAxwo6IV9blhYOsrs/7-1.thumb128.png";

  const ALREADY_ICON =
    "https://cdn2.cdnstep.com/2eEzAxwo6IV9blhYOsrs/17-1.thumb128.png";

  const ACCOUNT_SEPARATOR =
    "━━━━━━━━━━━━━━━━━━━━";

  const displayResults =
    results.map(result => ({
      result: result,
      status:
        classifyCheckInResult(
          result
        )
    }));

  const successCount =
    displayResults.filter(
      item =>
        item.status.key ===
        "success"
    ).length;

  const alreadyCount =
    displayResults.filter(
      item =>
        item.status.key ===
        "already"
    ).length;

  const errorCount =
    displayResults.filter(
      item =>
        item.status.key ===
        "error"
    ).length;

  const hasError =
    errorCount > 0;

  const allAlreadySigned =
    !hasError &&
    alreadyCount === results.length;

  let embedTitle;
  let headline;
  let embedColor;
  let centeredImage;

  if (hasError) {
    embedTitle =
      "⚠️ CHECK-IN PERLU DIPERIKSA";
    headline =
      "Sebagian akun mengalami kendala saat proses check-in.";
    embedColor =
      0xE74C3C;
    centeredImage =
      ERROR_ICON;
  } else if (
    allAlreadySigned
  ) {
    embedTitle =
      "☑️ SEMUA AKUN SUDAH AMAN";
    headline =
      "Seluruh akun sudah melakukan check-in hari ini.";
    embedColor =
      0xFDFD1F;
    centeredImage =
      ALREADY_ICON;
  } else {
    embedTitle =
      "✅ CHECK-IN HARIAN SELESAI";
    headline =
      "Proses check-in harian telah selesai dijalankan.";
    embedColor =
      0x57F287;
    centeredImage =
      ENDFIELD_ICON;
  }

  const summaryLine = [
    `✅ **${successCount}** berhasil`,
    `☑️ **${alreadyCount}** sudah`,
    `❌ **${errorCount}** gagal`
  ].join("  •  ");

  const accountFields =
    displayResults.map(
      (item, index) => {
        const result =
          item.result;

        const status =
          item.status;

        const nickname =
          truncateDiscordText(
            result.gameNickname ||
            result.accountName ||
            "Unknown",
            80
          );

        const roleId =
          String(
            result.roleId ||
            "Tidak tersedia"
          );

        const hasLevel =
          result.accountLevel !== null &&
          result.accountLevel !== undefined &&
          result.accountLevel !== "" &&
          Number.isFinite(
            Number(
              result.accountLevel
            )
          );

        const levelText =
          hasLevel
            ? String(
                Number(
                  result.accountLevel
                )
              )
            : "Tidak tersedia";

        const serverText =
          getServerDisplay(
            result
          );

        const valueLines = [
          `🆔 **ID:** \`${truncateDiscordText(roleId, 80)}\``,
          `📊 **Level:** \`${levelText}\``,
          `🌐 **Server:** ${truncateDiscordText(serverText, 100)}`,
          `${status.emoji} **Status:** ${status.label}`
        ];

        if (
          !result.profileFetched
        ) {
          valueLines.push(
            "⚠️ _Data profil real-time tidak berhasil dimuat._"
          );
        }

        if (
          status.key === "error"
        ) {
          valueLines.push(
            "📝 **Detail:** " +
            truncateDiscordText(
              status.detail,
              180
            )
          );
        }

        if (
          index <
          displayResults.length - 1
        ) {
          valueLines.push(
            "",
            ACCOUNT_SEPARATOR
          );
        }

        return {
          name:
            `👤 Nickname: ${nickname}`,
          value:
            valueLines.join("\n"),
          inline:
            false
        };
      }
    );

  const imageEmbed = {
    color:
      embedColor,
    image: {
      url:
        centeredImage
    }
  };

  const reportEmbed = {
    author: {
      name:
        "ENDFIELD // DAILY REPORT",
      icon_url:
        ENDFIELD_ICON
    },
    title:
      embedTitle,
    description: [
      headline,
      "",
      summaryLine
    ].join("\n"),
    color:
      embedColor,
    fields:
      accountFields,
    footer: {
      text:
        "My istri said",
      icon_url:
        ENDFIELD_ICON
    },
    timestamp:
      new Date().toISOString()
  };

  let contentText =
    discordPing();

  if (
    hasError &&
    contentText
  ) {
    contentText +=
      " • Ada akun yang membutuhkan perhatian.";
  }

  const payload =
    JSON.stringify({
      username:
        "Pelayan Daily Rob",
      avatar_url:
        ENDFIELD_ICON,
      content:
        contentText,
      allowed_mentions: {
        parse: [],
        users:
          myDiscordID
            ? [myDiscordID]
            : []
      },
      embeds: [
        imageEmbed,
        reportEmbed
      ]
    });

  const webhookResponse =
    trackedFetch(
      discordWebhook,
      {
        method: "post",
        contentType:
          "application/json",
        payload:
          payload,
        muteHttpExceptions:
          true
      }
    );

  const statusCode =
    webhookResponse
      .getResponseCode();

  const responseText =
    webhookResponse
      .getContentText();

  return {
    success:
      statusCode >= 200 &&
      statusCode < 300,
    statusCode:
      statusCode,
    message:
      statusCode >= 200 &&
      statusCode < 300
        ? "Discord notification sent"
        : truncateDiscordText(
            responseText,
            300
          )
  };
}
