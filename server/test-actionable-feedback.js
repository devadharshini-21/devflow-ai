const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("./app");

const User = require("./models/User");
const Project = require("./models/Project");
const CodeSubmission = require("./models/CodeSubmission");
const DeveloperCodeFinding = require("./models/DeveloperCodeFinding");

async function runActionableFeedbackVerification() {
  console.log("==================================================");
  console.log("DEVFLOW AI - ACTIONABLE FEEDBACK SYSTEM VERIFICATION");
  console.log("==================================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected to MongoDB Atlas");

  // Load existing accounts
  const managerUser = await User.findOne({ email: "devadharshini@gmail.com" });
  const frontendDev = await User.findOne({ email: "abirami@gmail.com" });
  const backendDev = await User.findOne({ email: "varma@gmail.com" });
  const uiuxDev = await User.findOne({ email: "gowri@gmail.com" });
  const qaTester = await User.findOne({ email: "algox@gmail.com" });

  const project = await Project.findOne({ name: "E-Commerce Platform" });
  if (!project) {
    throw new Error("E-Commerce Platform project not found!");
  }

  console.log(`✓ Project: "${project.name}" (ID: ${project._id})`);

  // Tokens
  const managerToken = jwt.sign({ id: managerUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const frontendToken = jwt.sign({ id: frontendDev._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const backendToken = jwt.sign({ id: backendDev._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const uiuxToken = jwt.sign({ id: uiuxDev._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Start test server
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`✓ Test Server running on ${baseUrl}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Developer Individual AI Analysis with Actionable Findings
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Developer Individual Analysis with Actionable Findings ---");
    const sub = await CodeSubmission.findOne({
      project: project._id,
      developer: frontendDev._id,
      fileName: "ProductList.jsx",
    });

    if (!sub) throw new Error("ProductList.jsx submission not found");

    const analyzeRes = await fetch(`${baseUrl}/api/code/${sub._id}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${frontendToken}` },
    });
    const analyzeData = await analyzeRes.json();
    console.log("Analyze status:", analyzeRes.status);
    console.log("Quality Score:", analyzeData.submission?.qualityScore);
    console.log("Summary:", analyzeData.submission?.summary?.slice(0, 60) + "...");
    console.log("Findings Count in Response:", analyzeData.findingsCount);

    if (analyzeRes.status !== 200 || !analyzeData.submission) {
      throw new Error("TEST 1 Failed: Individual analysis failed");
    }

    const savedIndivFindings = await DeveloperCodeFinding.find({
      codeSubmission: sub._id,
      developer: frontendDev._id,
    });
    console.log(`Saved individual findings in MongoDB: ${savedIndivFindings.length}`);
    savedIndivFindings.forEach((f) => {
      console.log(`  • [${f.severity}] ${f.title} (${f.fileName} : ${f.lineNumber})`);
      console.log(`    Problem: ${f.problem?.slice(0, 60)}...`);
      console.log(`    Fix: ${f.recommendedFix?.slice(0, 60)}...`);
    });

    if (savedIndivFindings.length === 0) {
      throw new Error("TEST 1 Failed: No findings persisted in DeveloperCodeFinding collection");
    }
    console.log("✓ TEST 1 PASSED: Individual analysis extracted and persisted actionable findings.");

    // ----------------------------------------------------
    // TEST 2: Developer Dashboard Findings Retrieval & Privacy
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Developer Dashboard Findings Retrieval & Privacy ---");
    const devFindingsRes = await fetch(`${baseUrl}/api/code/my-findings`, {
      headers: { Authorization: `Bearer ${frontendToken}` },
    });
    const devFindingsData = await devFindingsRes.json();
    console.log("Frontend Dev Findings status:", devFindingsRes.status);
    console.log("Total Findings:", devFindingsData.stats?.totalFindings);
    console.log("Critical Count:", devFindingsData.stats?.criticalCount);
    console.log("High Count:", devFindingsData.stats?.highCount);
    console.log("Last Analyzed:", devFindingsData.stats?.lastAnalyzedAt);

    if (devFindingsRes.status !== 200 || !devFindingsData.findings) {
      throw new Error("TEST 2 Failed: Failed to retrieve developer findings");
    }

    // Verify privacy: Developer strictly sees only their own developer ID
    const allBelongToDev = devFindingsData.findings.every(
      (f) => f.developer.toString() === frontendDev._id.toString()
    );
    if (!allBelongToDev) {
      throw new Error("TEST 2 Failed: Privacy violation! Found another developer's findings.");
    }
    console.log("✓ TEST 2 PASSED: Developer Dashboard retrieves private findings and summary metrics.");

    // ----------------------------------------------------
    // TEST 3: Manager Overall Project Analysis -> Developer-Specific Findings
    // ----------------------------------------------------
    console.log("\n--- TEST 3: Manager Overall Analysis with Developer Findings Extraction ---");
    console.log("Waiting 3s for API rate bucket...");
    await new Promise((r) => setTimeout(r, 3000));
    const overallRes = await fetch(`${baseUrl}/api/code/project/${project._id}/ai-insights`, {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const overallData = await overallRes.json();
    console.log("Overall Analysis status:", overallRes.status);
    console.log("Overall Quality Score:", overallData.analysis?.overallQualityScore, "/ 100");
    console.log("Health Status:", overallData.analysis?.healthStatus);
    console.log("Common Issues:", overallData.analysis?.commonIssues?.length);
    console.log("Developer Insights count:", overallData.analysis?.developerInsights?.length);

    if (overallRes.status !== 200) {
      throw new Error("TEST 3 Failed on overall project analysis");
    }

    // Check DeveloperCodeFinding collection for project_analysis findings
    const projectFindingsInDb = await DeveloperCodeFinding.find({
      project: project._id,
      source: "project_analysis",
    }).populate("developer", "name email role");

    console.log(`Saved Project-Wide Findings in MongoDB: ${projectFindingsInDb.length}`);
    projectFindingsInDb.forEach((f) => {
      console.log(`  • [${f.severity}] ${f.title} -> Developer: ${f.developer?.name} (${f.developer?.role})`);
      console.log(`    File: ${f.fileName} : ${f.lineNumber}`);
      console.log(`    Why It Matters: ${f.whyItMatters?.slice(0, 60)}...`);
    });

    if (projectFindingsInDb.length === 0) {
      throw new Error("TEST 3 Failed: Project analysis findings not persisted in MongoDB");
    }
    console.log("✓ TEST 3 PASSED: Manager Overall Analysis generated developer-specific actionable findings.");

    // ----------------------------------------------------
    // TEST 4: Manager Project Findings API
    // ----------------------------------------------------
    console.log("\n--- TEST 4: Manager Project Findings API ---");
    const mgrFindingsRes = await fetch(`${baseUrl}/api/code/project/${project._id}/findings`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const mgrFindingsData = await mgrFindingsRes.json();
    console.log("Manager Project Findings status:", mgrFindingsRes.status);
    console.log("Manager Project Findings count:", mgrFindingsData.count);

    if (mgrFindingsRes.status !== 200 || mgrFindingsData.count === 0) {
      throw new Error("TEST 4 Failed on /api/code/project/:id/findings");
    }
    console.log("✓ TEST 4 PASSED: Manager can access all project findings grouped by developer.");

    // ----------------------------------------------------
    // TEST 5: Developer Sees Fresh Findings After Manager Overall Analysis
    // ----------------------------------------------------
    console.log("\n--- TEST 5: Developer Sees Actionable Findings on Dashboard ---");
    const devBFindingsRes = await fetch(`${baseUrl}/api/code/my-findings`, {
      headers: { Authorization: `Bearer ${backendToken}` },
    });
    const devBFindingsData = await devBFindingsRes.json();
    console.log("Backend Dev Findings status:", devBFindingsRes.status);
    console.log("Backend Dev Total Findings:", devBFindingsData.stats?.totalFindings);
    devBFindingsData.findings.forEach((f) => {
      console.log(`  • [${f.severity}] ${f.title} (${f.fileName})`);
    });

    if (devBFindingsRes.status !== 200) {
      throw new Error("TEST 5 Failed for backend developer findings");
    }
    console.log("✓ TEST 5 PASSED: Backend Developer sees their actionable findings directly.");

    console.log("\n==================================================");
    console.log("ALL 5 ACTIONABLE FEEDBACK TESTS PASSED! 🎉");
    console.log("==================================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runActionableFeedbackVerification().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
