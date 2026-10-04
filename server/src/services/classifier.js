const CATEGORY_RULES = [
  {
    category: "Maintenance",
    keywords: ["water", "leak", "pipe", "plumbing", "tap", "faucet", "drain", "seepage", "toilet flush", "crack", "broken window", "door", "roof"],
  },
  {
    category: "Electrical",
    keywords: ["electric", "power", "light", "fan", "bulb", "switch", "wire", "socket", "short circuit", "shock", "generator", "ups"],
  },
  {
    category: "IT / Network",
    keywords: ["internet", "wifi", "network", "computer", "laptop", "printer", "system", "software", "server", "login", "email", "projector", "website"],
  },
  {
    category: "Cleaning",
    keywords: ["clean", "garbage", "waste", "dustbin", "trash", "dirt", "dirty", "sweep", "mop", "smell", "stink", "clogged", "hygiene"],
  },
  {
    category: "Security",
    keywords: ["security", "theft", "thief", "stolen", "cctv", "camera", "intruder", "guard", "suspicious", "vandalism", "trespass", "break-in"],
  },
  {
    category: "Facilities",
    keywords: ["lift", "elevator", "parking", "ac ", "air conditioner", "cooling", "furniture", "chair", "table", "desk", "canteen", "water cooler", "board"],
  },
];

const CRITICAL_KEYWORDS = ["fire", "emergency", "danger", "shock", "injury", "injured", "accident", "hazard", "safety", "gas leak", "smoke", "collapse", "live wire"];
const HIGH_KEYWORDS = ["urgent", "urgently", "immediately", "asap", "severe", "blocked", "not working at all", "completely stopped", "repeatedly", "again and again"];

function classify(text) {
  const lower = ` ${String(text).toLowerCase()} `;

  let category = "Other";
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      category = rule.category;
    }
  }

  let priority = "Medium";
  if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) {
    priority = "Critical";
  } else if (HIGH_KEYWORDS.some((k) => lower.includes(k))) {
    priority = "High";
  } else if (bestScore === 0) {
    priority = "Low";
  }

  return {
    category,
    priority,
    autoClassified: category !== "Other",
  };
}

module.exports = { classify };
