
const districtSelect = document.getElementById("district");
const tehsilSelect = document.getElementById("tehsil");
const villageSelect = document.getElementById("village");
const searchInput = document.getElementById("searchValue");
const searchButton = document.getElementById("searchBtn");
const message = document.getElementById("message");

let locationData = [];

function showMessage(text, type = "error", link = null) {
  message.className = "message " + type;
  message.replaceChildren(document.createTextNode(text));

  if (link) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = " आधिकारिक भूलेख पोर्टल खोलें";
    message.appendChild(document.createElement("br"));
    message.appendChild(a);
  }
}

function fillSelect(select, values, placeholder) {
  select.replaceChildren();

  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.disabled = values.length === 0;
}

async function loadLocations() {
  try {
    const response = await fetch("/api/locations");
    if (!response.ok) throw new Error("Location API error");

    const data = await response.json();
    locationData = data.locations || [];

    const districts = [
      ...new Set(locationData.map(x => x.district))
    ];

    fillSelect(districtSelect, districts, "जिला चुनें");

    if (data.sampleData) {
      showMessage(
        "ध्यान दें: अभी केवल उदाहरण के लिए कुछ स्थान उपलब्ध हैं।",
        "success"
      );
    }
  } catch (error) {
    showMessage("जिला सूची लोड नहीं हुई। सर्वर जाँचें।");
  }
}

districtSelect.addEventListener("change", () => {
  const district = locationData.find(
    x => x.district === districtSelect.value
  );

  fillSelect(
    tehsilSelect,
    district ? [district.tehsil] : [],
    "तहसील चुनें"
  );

  fillSelect(villageSelect, [], "पहले तहसील चुनें");
});

tehsilSelect.addEventListener("change", () => {
  const district = locationData.find(
    x => x.district === districtSelect.value
  );

  const villages =
    district && district.tehsil === tehsilSelect.value
      ? district.villages
      : [];

  fillSelect(villageSelect, villages, "गाँव चुनें");
});

searchButton.addEventListener("click", async () => {
  const district = districtSelect.value;
  const tehsil = tehsilSelect.value;
  const village = villageSelect.value;
  const searchValue = searchInput.value.trim();

  const selected = document.querySelector(
    'input[name="searchType"]:checked'
  );

  if (!district || !tehsil || !village) {
    return showMessage("कृपया जिला, तहसील और गाँव चुनें।");
  }

  if (!searchValue) {
    return showMessage("खोजने के लिए नाम या संख्या लिखें।");
  }

  if (!selected) {
    return showMessage("खोज का तरीका चुनें।");
  }

  searchButton.disabled = true;
  searchButton.textContent = "खोज जारी है...";
  showMessage("सरकारी डेटा कनेक्शन जाँचा जा रहा है...", "success");

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        district,
        tehsil,
        village,
        searchType: selected.value,
        searchValue
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(
        data.message || "अभी खतौनी डेटा उपलब्ध नहीं है।",
        "error",
        data.officialUrl || "https://upbhulekh.gov.in/"
      );
      return;
    }

    showMessage(
      data.message || "खोज पूरी हुई।",
      "success"
    );

  } catch (error) {
    showMessage("सर्वर से संपर्क नहीं हो पाया।");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "खतौनी खोजें";
  }
});

loadLocations();
