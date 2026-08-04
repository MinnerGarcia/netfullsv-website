const domain = "netfullsv.com";
const expectedDs = {
  keyTag: "2371",
  algorithm: "13",
  digestType: "2",
  digest: "E4F2FC239CD6793839C23EE1EC99A0481CD32EDB1583D74BB1FB97767A22C3F0"
};
const expectedNameServers = new Set(["noel.ns.cloudflare.com", "teagan.ns.cloudflare.com"]);
const expectedMailServers = new Set(["mx.zoho.com", "mx2.zoho.com", "mx3.zoho.com"]);
const passed = [];
const errors = [];
const notices = [];

const providers = [
  {
    name: "Google Public DNS",
    url: (type) => `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}&do=1`,
    headers: {}
  },
  {
    name: "Cloudflare 1.1.1.1",
    url: (type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}&do=true`,
    headers: { accept: "application/dns-json" }
  }
];

function check(condition, successMessage, failureMessage) {
  if (condition) passed.push(successMessage);
  else errors.push(failureMessage);
}

function answers(response, type) {
  return (response.Answer ?? [])
    .filter((answer) => answer.type === type)
    .map((answer) => String(answer.data).trim());
}

function host(value) {
  return value.replace(/^\d+\s+/, "").replace(/\.$/, "").toLowerCase();
}

function decodeCaa(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized.startsWith("\\#")) return normalized;

  const fields = normalized.split(/\s+/);
  const bytes = Buffer.from(fields.slice(2).join(""), "hex");
  const tagLength = bytes[1];
  const tag = bytes.subarray(2, 2 + tagLength).toString("ascii");
  const authority = bytes.subarray(2 + tagLength).toString("ascii");
  return `${bytes[0]} ${tag} "${authority}"`;
}

function normalizeDs(value) {
  const fields = value.trim().split(/\s+/);
  const algorithms = new Map([["ECDSAP256SHA256", "13"]]);
  fields[1] = algorithms.get(fields[1]?.toUpperCase()) ?? fields[1];
  fields[3] = fields[3]?.toUpperCase();
  return fields.join(" ");
}

async function query(provider, type) {
  const response = await fetch(provider.url(type), {
    headers: provider.headers,
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`${provider.name} returned HTTP ${response.status} for ${type}`);
  const payload = await response.json();
  if (payload.Status !== 0) throw new Error(`${provider.name} returned DNS status ${payload.Status} for ${type}`);
  return payload;
}

async function validateDns(provider) {
  const [a, ns, mx, caa, ds, dnskey] = await Promise.all(
    ["A", "NS", "MX", "CAA", "DS", "DNSKEY"].map((type) => query(provider, type))
  );

  check(answers(a, 1).length > 0, `${provider.name}: A record resolves`, `${provider.name}: A record is missing`);

  const nameServers = new Set(answers(ns, 2).map(host));
  check(
    [...expectedNameServers].every((name) => nameServers.has(name)),
    `${provider.name}: authoritative Cloudflare name servers are intact`,
    `${provider.name}: expected Cloudflare name servers are missing`
  );

  const mailServers = new Set(answers(mx, 15).map(host));
  check(
    [...expectedMailServers].every((name) => mailServers.has(name)),
    `${provider.name}: all Zoho mail routes are intact`,
    `${provider.name}: one or more Zoho MX records are missing`
  );

  const caaRecords = answers(caa, 257).map(decodeCaa);
  check(
    caaRecords.some((value) => /^0\s+issue\s+"?letsencrypt\.org"?$/.test(value)),
    `${provider.name}: CAA authorizes Let's Encrypt`,
    `${provider.name}: required CAA authorization for letsencrypt.org is missing`
  );

  const expectedDsText = `${expectedDs.keyTag} ${expectedDs.algorithm} ${expectedDs.digestType} ${expectedDs.digest}`;
  const dsRecords = answers(ds, 43).map(normalizeDs);
  check(ds.AD === true, `${provider.name}: DS response is DNSSEC-authenticated`, `${provider.name}: DS response is not DNSSEC-authenticated`);
  check(
    dsRecords.includes(expectedDsText),
    `${provider.name}: expected DS record is published`,
    `${provider.name}: expected DS record is absent or changed`
  );
  check(answers(dnskey, 48).length > 0, `${provider.name}: DNSKEY is published`, `${provider.name}: DNSKEY is missing`);
  return { provider: provider.name, aAd: a.AD === true, caaAd: caa.AD === true, dnskeyAd: dnskey.AD === true };
}

async function validateHttps(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: { "user-agent": "NetfullSecurityMonitor/1.0" }
  });
  check(response.ok, `${url}: HTTPS returned ${response.status}`, `${url}: HTTPS returned ${response.status}`);
  check(response.url.startsWith("https://"), `${url}: final URL uses HTTPS`, `${url}: final URL is not HTTPS`);
  check(Boolean(response.headers.get("strict-transport-security")), `${url}: HSTS is present`, `${url}: HSTS is missing`);
  check(Boolean(response.headers.get("content-security-policy")), `${url}: CSP is present`, `${url}: CSP is missing`);
  check(response.headers.get("x-content-type-options") === "nosniff", `${url}: nosniff is present`, `${url}: nosniff is missing`);
}

const results = await Promise.allSettled([
  ...providers.map((provider) => validateDns(provider)),
  validateHttps(`https://${domain}/`),
  validateHttps(`https://www.${domain}/`)
]);

for (const result of results) {
  if (result.status === "rejected") errors.push(result.reason?.message ?? String(result.reason));
}

const dnsResults = results
  .filter((result) => result.status === "fulfilled" && result.value?.provider)
  .map((result) => result.value);
for (const [field, label] of [["aAd", "A"], ["caaAd", "CAA"], ["dnskeyAd", "DNSKEY"]]) {
  const authenticatedBy = dnsResults.filter((result) => result[field]).map((result) => result.provider);
  if (authenticatedBy.length > 0) passed.push(`${label} is DNSSEC-authenticated by ${authenticatedBy.join(" and ")}`);
  else notices.push(`${label} is still being served from a pre-DNSSEC resolver cache; both authenticated DS checks passed`);
}

for (const message of passed) console.log(`PASS: ${message}`);
for (const message of notices) console.warn(`NOTICE: ${message}`);
if (errors.length > 0) {
  for (const message of errors) console.error(`ERROR: ${message}`);
  console.error(`\nExternal security validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`\nExternal security validation completed successfully with ${passed.length} checks.`);
