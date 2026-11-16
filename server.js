
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const OFFICIAL_URL = "https://upbhulekh.gov.in/";

// अभी केवल उदाहरण के लिए एक गाँव है।
// इसे पूरे UP की सत्यापित सरकारी सूची न समझें।
const locations = [
  {
    district: "प्रयागराज",
    tehsil: "बारा",
    villages: ["पंडुवा"]
  }
];

// Server health
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "UP Khatauni API is running",
    governmentDataConnected: false
  });
});

// District list
app.get("/api/locations", (req, res) => {
  const districts = [...new Set(
    locations.map(item => item.district)
  )];

  res.json({
    success: true,
    sampleData: true,
    districts,
    locations,
    message: "यह अभी sample location list है।"
  });
});

// Search khatauni
app.post("/api/search", (req, res) => {
  const {
    district,
    tehsil,
    village,
    searchType,
    searchValue
  } = req.body || {};

  if (
    !district ||
    !tehsil ||
    !village ||
    !searchType ||
    !searchValue
  ) {
    return res.status(400).json({
      success: false,
      message: "कृपया सभी जानकारी भरें।"
    });
  }

  const allowedTypes = ["name", "khata", "gata"];

  if (!allowedTypes.includes(searchType)) {
    return res.status(400).json({
      success: false,
      message: "खोज का प्रकार सही नहीं है।"
    });
  }

  // सरकारी API endpoint और अनुमति मिलने तक
  // कोई नकली खतौनी परिणाम नहीं बनाया जाएगा।
  return res.status(503).json({
    success: false,
    governmentDataConnected: false,
    message:
      "सरकारी खतौनी डेटा कनेक्शन अभी उपलब्ध नहीं है। आधिकारिक भूलेख पोर्टल पर खोज जारी रखें।",
    officialUrl: OFFICIAL_URL
  });
});

// Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
