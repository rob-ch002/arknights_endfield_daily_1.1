import webpush from "web-push";

const required = ["GAS_URL", "PUSH_BATCH_SECRET", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
}

webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

const gasUrl = process.env.GAS_URL.replace(/\/$/, "");
const secret = process.env.PUSH_BATCH_SECRET;
const batchUrl = new URL(gasUrl);
batchUrl.searchParams.set("action", "pushbatch");
batchUrl.searchParams.set("secret", secret);
batchUrl.searchParams.set("_", String(Date.now()));

const batchResponse = await fetch(batchUrl, { redirect: "follow" });
if (!batchResponse.ok) throw new Error(`Batch HTTP ${batchResponse.status}`);
const batch = await batchResponse.json();
if (!batch.success) throw new Error(batch.message || "Push batch failed");

const events = Array.isArray(batch.events) ? batch.events : [];
const subscriptions = Array.isArray(batch.subscriptions) ? batch.subscriptions : [];
const delivered = new Set();
const expired = new Set();

for (const event of events) {
  const payload = JSON.stringify({
    title: event.title || "Endfield Protocol",
    body: event.body || "New notification",
    tag: `endfield-${event.type || "alert"}-${event.slug || "global"}`,
    url: event.url || "./?view=alerts",
    data: { eventId: event.id, slug: event.slug || null }
  });
  let deliveredToAny = false;
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime || null,
        keys: subscription.keys
      }, payload, { TTL: 3600, urgency: "normal" });
      deliveredToAny = true;
    } catch (error) {
      const statusCode = error?.statusCode || error?.status;
      if (statusCode === 404 || statusCode === 410) expired.add(subscription.endpoint);
      else console.error("Push delivery failed:", statusCode || "unknown", error?.message || error);
    }
  }
  if (deliveredToAny) delivered.add(event.id);
}

const ackUrl = new URL(gasUrl);
ackUrl.searchParams.set("action", "ackpush");
ackUrl.searchParams.set("secret", secret);
ackUrl.searchParams.set("ids", [...delivered].join(","));
ackUrl.searchParams.set("expired_endpoints", [...expired].join("|"));
ackUrl.searchParams.set("_", String(Date.now()));
const ackResponse = await fetch(ackUrl, { redirect: "follow" });
const ack = await ackResponse.json();
if (!ack.success) throw new Error(ack.message || "Push acknowledgement failed");
console.log(JSON.stringify({ events: events.length, subscriptions: subscriptions.length, delivered: delivered.size, expired: expired.size, remaining: ack.remainingEvents }, null, 2));
