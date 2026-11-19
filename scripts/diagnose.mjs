const base = "https://emhqremyuckdojwtseok.supabase.co/rest/v1";
const anonKey = "sb_publishable_bgxDklgyuCG5IKtcHEvzuw_aUjEDzJm";

async function run() {
  console.log("Testing Supabase with ANON key...");
  try {
    const res = await fetch(`${base}/ecoles`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    console.log("Status:", res.status, res.statusText);
    const body = await res.text();
    console.log("Body:", body);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
