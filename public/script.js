document.getElementById("weatherMonitoring").style.display = "none";
document.getElementById("ruleEngine").style.display = "none";
function loadComponent(component) {
  console.log(component);
  const parentDiv = document.getElementById("componentContainer");
  const childDiv = document.getElementById(component);
  parentDiv.appendChild(childDiv);
  if (component === "weatherMonitoring") {
    document.getElementById("weatherMonitoring").style.display = "block";
    document.getElementById("ruleEngine").style.display = "none";
  } else {
    document.getElementById("weatherMonitoring").style.display = "none";
    document.getElementById("ruleEngine").style.display = "block";
  }
  updateTabStyles(component);
}

function updateTabStyles(selectedComponent) {
  const tab1 = document.getElementById("weatherMonitoring-tab");
  const tab2 = document.getElementById("ruleEngine-tab");
  if (selectedComponent == "weatherMonitoring") {
    tab1.classList.add("text-blue-500", "font-semibold");
    tab1.classList.remove("text-gray-500");
    tab2.classList.remove("text-blue-500", "font-semibold");
    tab2.classList.add("text-gray-500");
  } else {
    tab2.classList.add("text-blue-500", "font-semibold");
    tab2.classList.remove("text-gray-500");
    tab1.classList.remove("text-blue-500", "font-semibold");
    tab1.classList.add("text-gray-500");
  }
}
const generateASTHtml = (node, parentId = "root", level = 0) => {
  if (!node) return "";

  const nodeId = `node-${level}-${parentId}`;
  const contentId = `${nodeId}-content`;
  let html =
    node.type === "operator"
      ? `
    <div class="hv-item">
      <div class="hv-item-parent">
        <div id="${contentId}">${node.value}</div>
      </div>`
      : `
    <div class="hv-item">
      <div class="hv-item-child">
        <div id="${contentId}">${node.value}</div>
      </div>`;

  if (node.type === "operator") {
    html += `
      <div class="hv-item-children">
        <div class="hv-item-child" id="${nodeId}-left">
          ${generateASTHtml(node.left, `${nodeId}-left`, level + 1)}
        </div>
        <div class="hv-item-child" id="${nodeId}-right">
          ${generateASTHtml(node.right, `${nodeId}-right`, level + 1)}
        </div>
      </div>`;
  }

  html += `</div>`;
  return html;
};

const selectedRules = [];

function openModal() {
  document.getElementById("ruleModal").classList.remove("hidden");
  fetchRules();
}

function closeModal() {
  document.getElementById("ruleModal").classList.add("hidden");
}

async function fetchRules() {
  const response = await fetch("http://localhost:3001/api/rules/get-all-rules");
  const rules = await response.json();
  displayRules(rules);
}

function displayRules(rules) {
  const rulesList = document.getElementById("rulesList");
  rulesList.innerHTML = "";
  rules.forEach((rule) => {
    const ruleItem = document.createElement("div");
    ruleItem.classList.add("flex", "items-center", "mb-2");
    ruleItem.innerHTML = `
      <input type="checkbox" id="${rule._id}" value="${rule.ruleString}" onchange="handleRuleSelection(event)" class="mr-2">
      <label for="${rule._id}">${rule.ruleString}</label>
    `;
    rulesList.appendChild(ruleItem);
  });
}

async function createRule() {
  const ruleString = document.getElementById("ruleInput").value;
  const response = await fetch("http://localhost:3001/api/rules/create_rule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ruleString }),
  });

  const result = await response.json();
  const ast = result.ast;

  // Generate HTML for the AST and display it
  if (ast) {
    const astHtml = generateASTHtml(ast);
    document.getElementById(
      "astOutput"
    ).innerHTML = `<div class="hv-container"><div class="hv-wrapper">${astHtml}</div></div>`;
  } else {
    document.getElementById("astOutput").innerHTML = result.message;
  }
}

function handleRuleSelection(event) {
  const ruleString = event.target.value;
  if (event.target.checked) {
    selectedRules.push(ruleString);
  } else {
    const index = selectedRules.indexOf(ruleString);
    if (index > -1) {
      selectedRules.splice(index, 1);
    }
  }
}

async function combineSelectedRules() {
  if (selectedRules.length === 0) {
    alert("Please select at least one rule to combine.");
    return;
  }

  console.log(selectedRules);

  try {
    const response = await fetch(
      " http://localhost:3001/api/rules/combine_rules",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedRules }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to combine rules");
    }

    const result = await response.json();
    const ast = result.ast;
    if (ast) {
      const astHtml = generateASTHtml(ast);
      document.getElementById(
        "astOutput"
      ).innerHTML = `<div class="hv-container"><div class="hv-wrapper">${astHtml}</div></div>`;
    } else {
      document.getElementById("astOutput").innerHTML = result.message;
    }
    closeModal();
  } catch (error) {
    console.error("Error combining rules:", error);
    alert("An error occurred while combining the rules. Please try again.");
  }
}

async function evaluateRule() {
  try {
    const dataInput = document.getElementById("dataInput").value;
    const astResponse = await fetch(
      "http://localhost:3001/api/rules/latest_ast"
    );
    if (!astResponse.ok) {
      throw new Error("Failed to fetch latest AST");
    }
    const astOutput = await astResponse.json();
    let data;
    let ast = astOutput.ast;
    try {
      data = JSON.parse(dataInput);
    } catch (e) {
      throw new Error("Invalid data JSON");
    }
    const response = await fetch(
      "http://localhost:3001/api/rules/evaluate_rule",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ast, data }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API response error: ${errorText}`);
    }

    // Handle successful response
    const result = await response.json();
    document.getElementById(
      "evaluationOutput"
    ).innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
  } catch (error) {
    console.error("Error:", error);
    document.getElementById(
      "evaluationOutput"
    ).innerHTML = `<pre>${error.message}</pre>`;
  }
}

async function fetchWeatherSummary() {
  const response = await fetch(
    "http://localhost:3001/api/weather/weather_summary"
  );
  const result = await response.json();
  document.getElementById(
    "weatherSummaryOutput"
  ).innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
}
async function updateAlert() {
  const temperatureThreshold = document.getElementById(
    "temperatureThreshold"
  ).value;
  const conditionThreshold =
    document.getElementById("conditionThreshold").value;
  const response = await fetch(
    "http://localhost:3001/api/weather/update_alert_threshold",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temperatureThreshold, conditionThreshold }),
    }
  );
  const result = await response.json();
  alert(result.message);
}

async function loadChart() {
  const infoMessageDiv = document.getElementById("info-message");
  infoMessageDiv.style.display = "none";
  const response = await fetch(
    "http://localhost:3001/api/weather/weather_summary"
  );
  const result = await response.json();
  const weatherData = result.hourlyData;
  console.log(result);
  const today = new Date().toISOString().split("T")[0];

  if (result.date == today) {
    infoMessageDiv.style.display = "flex";
  }
  document.getElementById("weather-main").innerText = weatherData[0].main;
  document.getElementById(
    "weather-temp"
  ).innerHTML = `${weatherData[0].temp.toFixed(
    1
  )}º<span class="font-normal text-gray-700 mx-1">/</span>${weatherData[0].feels_like.toFixed(
    1
  )}º`;

  const date = new Date(result.date);
  document.getElementById("weather-date").innerText = date.toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric" }
  );
  const labels = weatherData.map((entry) => new Date(entry.dt * 1000));
  const temperatures = weatherData.map((entry) => entry.temp);
  const ctx = document.getElementById("weatherChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "°C";
            },
          },
        },
      },
    },
  });
}

// Load the default component
loadComponent("ruleEngine");
loadChart();
