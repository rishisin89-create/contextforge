const requirementsInput = document.getElementById("requirements");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");

const emptyState = document.getElementById("emptyState");
const results = document.getElementById("results");
const localStatus = document.getElementById("localStatus");

const goal = document.getElementById("goal");
const requirementsList = document.getElementById("requirementsList");
const architectureList = document.getElementById("architectureList");
const buildPlanList = document.getElementById("buildPlanList");
const ambiguitiesList = document.getElementById("ambiguitiesList");

requirementsInput.addEventListener("input", () => {
  charCount.textContent = `${requirementsInput.value.length.toLocaleString()} / 12,000`;
});

clearBtn.addEventListener("click", () => {
  requirementsInput.value = "";
  charCount.textContent = "0 / 12,000";
  status.textContent = "";
  results.classList.add("hidden");
  emptyState.classList.remove("hidden");
  localStatus.textContent = "Waiting";
  localStatus.classList.remove("success");
});

function populateList(element, items, emptyText) {
  element.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    li.style.color = "#697385";
    element.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

analyzeBtn.addEventListener("click", async () => {
  const requirements = requirementsInput.value.trim();

  if (!requirements) {
    status.textContent = "Enter some project requirements first.";
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing locally...";
  status.textContent = "Loading QVAC and analyzing your requirements...";
  localStatus.textContent = "Processing";
  localStatus.classList.remove("success");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requirements }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    goal.textContent = data.goal;

    populateList(
      requirementsList,
      data.requirements,
      "No specific requirements extracted."
    );

    populateList(
      architectureList,
      data.architecture,
      "No architecture components identified."
    );

    populateList(
      buildPlanList,
      data.buildPlan,
      "No build steps generated."
    );

    populateList(
      ambiguitiesList,
      data.ambiguities,
      "No major ambiguities identified."
    );

    emptyState.classList.add("hidden");
    results.classList.remove("hidden");

    localStatus.textContent = "✓ Local QVAC";
    localStatus.classList.add("success");
    status.textContent = "Analysis complete — processed locally with QVAC.";
  } catch (error) {
    status.textContent = error.message;
    localStatus.textContent = "Error";
    localStatus.classList.remove("success");
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Requirements →";
  }
});

const exampleRequirements =
  "Build a college event management website. Students should be able to browse upcoming events, register for events, and receive confirmation. Organizers should be able to create events, manage registrations, and view attendee lists. The website should have a dashboard, authentication, event search, and an admin panel. It should work well on mobile devices.";

const textarea = document.querySelector("textarea");
const actionArea = document.querySelector(".input-footer");

if (textarea && actionArea) {
  const exampleButton = document.createElement("button");
  exampleButton.type = "button";
  exampleButton.textContent = "Load Example";
  exampleButton.className = "secondary-button";

  exampleButton.addEventListener("click", () => {
    textarea.value = exampleRequirements;
    textarea.dispatchEvent(new Event("input"));
    textarea.focus();
  });

  actionArea.insertBefore(exampleButton, actionArea.firstChild);
}
