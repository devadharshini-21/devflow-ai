const CodeSubmission = require("../models/CodeSubmission");
const Project = require("../models/Project");
const ProjectAnalysis = require("../models/ProjectAnalysis");
const DeveloperCodeFinding = require("../models/DeveloperCodeFinding");
const {
  analyzeCode,
  analyzeProjectOverallAI,
} = require("../services/aiCodeService");

// ==========================================
// CREATE CODE SUBMISSION (DEVELOPER)
// ==========================================

const createCodeSubmission = async (req, res) => {
  try {
    const {
      project,
      fileName,
      language,
      code,
    } = req.body;

    // Check required fields
    if (!project || !fileName || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "Project, fileName, language and code are required",
      });
    }

    // Check project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Perform AI analysis on submitted code using Gemini
    const aiResult = await analyzeCode({
      code,
      fileName: fileName.trim(),
      language: language.trim(),
    });

    // Create a new code submission record
    const submission = await CodeSubmission.create({
      developer: req.user._id,
      project,
      fileName: fileName.trim(),
      language: language.trim(),
      code,
      summary: aiResult.summary || "",
      errors: aiResult.errors || [],
      warnings: aiResult.warnings || [],
      suggestions: aiResult.suggestions || [],
      qualityScore: aiResult.qualityScore ?? 0,
      aiAnalysis: aiResult.aiAnalysis || "",
    });

    // Persist actionable code findings
    if (Array.isArray(aiResult.findings) && aiResult.findings.length > 0) {
      const findingsToInsert = aiResult.findings.map((f) => ({
        project: submission.project,
        developer: req.user._id,
        codeSubmission: submission._id,
        fileName: submission.fileName,
        language: submission.language,
        severity: f.severity || "MEDIUM",
        category: f.category || "Code Quality",
        title: f.title || "Code Finding",
        lineNumber: f.lineNumber || "Unable to determine exact line",
        codeSnippet: f.codeSnippet || "",
        problem: f.problem || "",
        whyItMatters: f.whyItMatters || "",
        recommendedFix: f.recommendedFix || "",
        suggestedCode: f.suggestedCode || "",
        developerAction: f.developerAction || "",
        analyzedAt: new Date(),
        source: "individual",
      }));
      await DeveloperCodeFinding.insertMany(findingsToInsert);
    }

    const populatedSubmission = await CodeSubmission.findById(submission._id)
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack");

    res.status(201).json({
      success: true,
      message: "Code submitted and analyzed successfully",
      submission: populatedSubmission,
      findingsCount: aiResult.findings?.length || 0,
    });
  } catch (error) {
    console.error("Create Code Submission Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit and analyze code",
    });
  }
};

// ==========================================
// GET MY CODE SUBMISSIONS (DEVELOPER ONLY)
// ==========================================

const getMyCodeSubmissions = async (req, res) => {
  try {
    // Strictly filter by the authenticated user's ID from JWT
    const submissions = await CodeSubmission.find({
      developer: req.user._id,
    })
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get My Code Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your code submissions",
    });
  }
};

// ==========================================
// GET ALL CODE SUBMISSIONS (MANAGER ONLY)
// ==========================================

const getAllCodeSubmissions = async (req, res) => {
  try {
    // Backend Role Enforcement: Only Project Managers can view all developer submissions
    if (req.user.role !== "Project Manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Project Managers can view all developer submissions.",
      });
    }

    const { projectId, developerId, language, search } = req.query;

    const query = {};

    if (projectId) {
      query.project = projectId;
    }

    if (developerId) {
      query.developer = developerId;
    }

    if (language) {
      query.language = { $regex: new RegExp(`^${language}$`, "i") };
    }

    if (search && search.trim()) {
      query.fileName = { $regex: search.trim(), $options: "i" };
    }

    const submissions = await CodeSubmission.find(query)
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get All Code Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch code submissions",
    });
  }
};

// ==========================================
// GET SINGLE CODE SUBMISSION BY ID
// ==========================================

const getCodeSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await CodeSubmission.findById(id)
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack manager");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Code submission not found",
      });
    }

    // Ownership & Role Verification:
    // User must be the developer owner or a Project Manager
    const isOwner = submission.developer?._id?.toString() === req.user._id.toString();
    const isManager =
      req.user.role === "Project Manager" ||
      submission.project?.manager?.toString() === req.user._id.toString();

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to view this code submission.",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Get Code Submission By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch code submission",
    });
  }
};

// ==========================================
// GET PROJECT CODE SUBMISSIONS (MANAGER)
// ==========================================

const getProjectCodeSubmissions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Verify manager authorization
    const isManager = project.manager.toString() === req.user._id.toString();
    if (!isManager && req.user.role !== "Project Manager") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only project managers can access all project code submissions.",
      });
    }

    const submissions = await CodeSubmission.find({ project: projectId })
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get Project Code Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project code submissions",
    });
  }
};

// ==========================================
// RE-ANALYZE INDIVIDUAL SUBMISSION
// ==========================================

const analyzeSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await CodeSubmission.findById(id).populate("project");
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Code submission not found",
      });
    }

    // Check authorization: developer owner or manager
    const isOwner = submission.developer.toString() === req.user._id.toString();
    const isManager =
      req.user.role === "Project Manager" ||
      submission.project?.manager?.toString() === req.user._id.toString();

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to analyze this submission",
      });
    }

    const aiResult = await analyzeCode({
      code: submission.code,
      fileName: submission.fileName,
      language: submission.language,
    });

    submission.summary = aiResult.summary || submission.summary;
    submission.errors = aiResult.errors || [];
    submission.warnings = aiResult.warnings || [];
    submission.suggestions = aiResult.suggestions || [];
    submission.qualityScore = aiResult.qualityScore ?? submission.qualityScore;
    submission.aiAnalysis = aiResult.aiAnalysis || submission.aiAnalysis;

    await submission.save();

    // Persist actionable code findings
    await DeveloperCodeFinding.deleteMany({ codeSubmission: submission._id });
    if (Array.isArray(aiResult.findings) && aiResult.findings.length > 0) {
      const findingsToInsert = aiResult.findings.map((f) => ({
        project: submission.project?._id || submission.project,
        developer: submission.developer,
        codeSubmission: submission._id,
        fileName: submission.fileName,
        language: submission.language,
        severity: f.severity || "MEDIUM",
        category: f.category || "Code Quality",
        title: f.title || "Code Finding",
        lineNumber: f.lineNumber || "Unable to determine exact line",
        codeSnippet: f.codeSnippet || "",
        problem: f.problem || "",
        whyItMatters: f.whyItMatters || "",
        recommendedFix: f.recommendedFix || "",
        suggestedCode: f.suggestedCode || "",
        developerAction: f.developerAction || "",
        analyzedAt: new Date(),
        source: "individual",
      }));
      await DeveloperCodeFinding.insertMany(findingsToInsert);
    }

    const populated = await CodeSubmission.findById(submission._id)
      .populate("developer", "name email role")
      .populate("project", "name status technologyStack");

    res.status(200).json({
      success: true,
      message: "Code analyzed successfully",
      submission: populated,
      findingsCount: aiResult.findings?.length || 0,
    });
  } catch (error) {
    console.error("Analyze Submission Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze code submission",
    });
  }
};

// ==========================================
// OVERALL PROJECT AI ANALYSIS (MANAGER)
// ==========================================

const analyzeProjectOverall = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isManager = project.manager?.toString() === req.user._id.toString();
    if (!isManager && req.user.role !== "Project Manager") {
      return res.status(403).json({
        success: false,
        message: "Only project managers can run overall project analysis",
      });
    }

    // Retrieve strictly the submissions belonging to this project
    const submissions = await CodeSubmission.find({ project: projectId })
      .populate("developer", "name email role")
      .sort({ createdAt: -1 });

    if (submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No code submissions are available for this project yet.",
      });
    }

    console.log("[OVERALL AI] Project ID:", projectId);
    console.log("[OVERALL AI] Submissions found:", submissions.length);
    console.log("[OVERALL AI] Model:", process.env.GEMINI_MODEL || "gemini-2.5-flash");
    console.log("[OVERALL AI] Analysis started");

    const overallInsights = await analyzeProjectOverallAI({
      projectName: project.name,
      technologyStack: project.technologyStack,
      submissions,
    });

    console.log("[OVERALL AI] Analysis completed");

    // Persist to MongoDB ProjectAnalysis collection
    const projectAnalysisDoc = await ProjectAnalysis.create({
      project: project._id,
      generatedBy: req.user._id,
      overallQualityScore: overallInsights.overallQualityScore,
      healthStatus: overallInsights.healthStatus,
      summary: overallInsights.summary,
      commonIssues: overallInsights.commonIssues,
      securityConcerns: overallInsights.securityConcerns,
      maintainabilityConcerns: overallInsights.maintainabilityConcerns,
      developerInsights: overallInsights.developerInsights,
      strongAreas: overallInsights.strongAreas,
      recommendations: overallInsights.recommendations,
      submissionsAnalyzedCount: submissions.length,
    });

    // Persist developer-specific actionable findings from project analysis
    await DeveloperCodeFinding.deleteMany({
      project: project._id,
      source: "project_analysis",
    });

    if (
      Array.isArray(overallInsights.developerFindings) &&
      overallInsights.developerFindings.length > 0
    ) {
      const devByName = new Map();
      const devByFile = new Map();
      submissions.forEach((s) => {
        if (s.developer) {
          const devId = s.developer._id || s.developer;
          const devName = (s.developer.name || "").toLowerCase().trim();
          if (devName) devByName.set(devName, devId);
          if (s.fileName) devByFile.set(s.fileName.toLowerCase().trim(), devId);
        }
      });

      const findingsToInsert = [];
      for (const f of overallInsights.developerFindings) {
        let matchedDevId = null;
        if (f.developerName) {
          matchedDevId = devByName.get(f.developerName.toLowerCase().trim());
        }
        if (!matchedDevId && f.fileName) {
          matchedDevId = devByFile.get(f.fileName.toLowerCase().trim());
        }
        if (!matchedDevId && submissions.length > 0) {
          matchedDevId = submissions[0].developer?._id || submissions[0].developer;
        }

        if (matchedDevId) {
          const matchingSub = submissions.find(
            (s) => s.fileName?.toLowerCase() === f.fileName?.toLowerCase()
          );

          findingsToInsert.push({
            project: project._id,
            developer: matchedDevId,
            codeSubmission: matchingSub?._id,
            projectAnalysis: projectAnalysisDoc._id,
            fileName: f.fileName || (matchingSub?.fileName || "Project Code"),
            language: matchingSub?.language || "javascript",
            severity: f.severity || "MEDIUM",
            category: f.category || "Code Quality",
            title: f.title || "Actionable Code Finding",
            lineNumber: f.lineNumber || "Unable to determine exact line",
            codeSnippet: f.codeSnippet || "",
            problem: f.problem || "",
            whyItMatters: f.whyItMatters || "",
            recommendedFix: f.recommendedFix || "",
            suggestedCode: f.suggestedCode || "",
            developerAction: f.developerAction || "",
            analyzedAt: new Date(),
            source: "project_analysis",
          });
        }
      }

      if (findingsToInsert.length > 0) {
        await DeveloperCodeFinding.insertMany(findingsToInsert);
      }
    }

    const populatedAnalysis = await ProjectAnalysis.findById(projectAnalysisDoc._id).populate(
      "generatedBy",
      "name email role"
    );

    res.status(200).json({
      success: true,
      message: "Project overall AI analysis generated successfully",
      projectName: project.name,
      totalSubmissions: submissions.length,
      analysis: populatedAnalysis,
      insights: overallInsights,
    });
  } catch (error) {
    console.error("Overall Project Analysis Controller Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate overall project analysis",
    });
  }
};

// ==========================================
// GET LATEST PROJECT AI ANALYSIS (MANAGER)
// ==========================================

const getLatestProjectAnalysis = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isManager = project.manager?.toString() === req.user._id.toString();
    if (!isManager && req.user.role !== "Project Manager") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only project managers can access project AI insights.",
      });
    }

    const latestAnalysis = await ProjectAnalysis.findOne({ project: projectId })
      .sort({ createdAt: -1 })
      .populate("generatedBy", "name email role");

    res.status(200).json({
      success: true,
      analysis: latestAnalysis || null,
    });
  } catch (error) {
    console.error("Get Latest Project Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve project analysis",
    });
  }
};

// ==========================================
// GET MY CODE FINDINGS (DEVELOPER)
// ==========================================

const getMyCodeFindings = async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = { developer: req.user._id };
    if (projectId) {
      query.project = projectId;
    }

    const findings = await DeveloperCodeFinding.find(query)
      .populate("project", "name status technologyStack")
      .populate("codeSubmission", "fileName language qualityScore")
      .sort({ analyzedAt: -1, createdAt: -1 });

    const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
    const highCount = findings.filter((f) => f.severity === "HIGH").length;
    const mediumCount = findings.filter((f) => f.severity === "MEDIUM").length;
    const lowCount = findings.filter(
      (f) => f.severity === "LOW" || f.severity === "INFO"
    ).length;
    const warningsCount = highCount + mediumCount + lowCount;
    const lastAnalyzedAt = findings.length > 0 ? findings[0].analyzedAt : null;

    res.status(200).json({
      success: true,
      count: findings.length,
      stats: {
        totalFindings: findings.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        warningsCount,
        lastAnalyzedAt,
      },
      findings,
    });
  } catch (error) {
    console.error("Get My Code Findings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch code review findings",
    });
  }
};

// ==========================================
// GET PROJECT CODE FINDINGS (MANAGER)
// ==========================================

const getProjectCodeFindings = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isManager = project.manager?.toString() === req.user._id.toString();
    if (!isManager && req.user.role !== "Project Manager") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only project managers can access project findings.",
      });
    }

    const findings = await DeveloperCodeFinding.find({ project: projectId })
      .populate("developer", "name email role")
      .populate("project", "name")
      .sort({ analyzedAt: -1, severity: 1 });

    res.status(200).json({
      success: true,
      count: findings.length,
      findings,
    });
  } catch (error) {
    console.error("Get Project Code Findings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project code findings",
    });
  }
};

// ==========================================
// GET MY MANAGER AI REVIEWS (DEVELOPER ONLY)
// ==========================================

const getMyManagerReviews = async (req, res) => {
  try {
    const developerId = req.user._id;

    // 1. Find all project IDs where developer is on team or has findings
    const developerProjects = await Project.find({ team: developerId }).select("_id");
    const projectIds = developerProjects.map((p) => p._id);

    const distinctFindingProjectIds = await DeveloperCodeFinding.distinct("project", {
      developer: developerId,
      source: "project_analysis",
    });

    const combinedProjectIds = Array.from(
      new Set([
        ...projectIds.map((id) => id.toString()),
        ...distinctFindingProjectIds.map((id) => id.toString()),
      ])
    );

    if (combinedProjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
      });
    }

    // 2. Find all ProjectAnalysis records for these projects
    const analyses = await ProjectAnalysis.find({
      project: { $in: combinedProjectIds },
    })
      .populate("project", "name status technologyStack description")
      .populate("generatedBy", "name email role")
      .sort({ createdAt: -1 });

    // 3. For each analysis run, strictly fetch only THIS developer's findings
    const reviews = [];
    for (const analysis of analyses) {
      const devFindings = await DeveloperCodeFinding.find({
        projectAnalysis: analysis._id,
        developer: developerId,
      }).sort({ severity: 1, createdAt: -1 });

      const criticalCount = devFindings.filter((f) => f.severity === "CRITICAL").length;
      const highCount = devFindings.filter((f) => f.severity === "HIGH").length;
      const mediumCount = devFindings.filter((f) => f.severity === "MEDIUM").length;
      const lowCount = devFindings.filter(
        (f) => f.severity === "LOW" || f.severity === "INFO"
      ).length;

      reviews.push({
        _id: analysis._id,
        project: analysis.project,
        analyzedBy: {
          _id: analysis.generatedBy?._id,
          name: analysis.generatedBy?.name || "Project Manager",
          role: analysis.generatedBy?.role || "Project Manager",
          email: analysis.generatedBy?.email,
        },
        analyzedAt: analysis.createdAt,
        overallQualityScore: analysis.overallQualityScore,
        healthStatus: analysis.healthStatus,
        submissionsAnalyzedCount: analysis.submissionsAnalyzedCount,
        developerIssuesCount: devFindings.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        findings: devFindings,
      });
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get My Manager Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager AI reviews",
    });
  }
};

// ==========================================
// GET SINGLE MANAGER REVIEW DETAIL (DEVELOPER ONLY)
// ==========================================

const getMyManagerReviewById = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const developerId = req.user._id;

    const analysis = await ProjectAnalysis.findById(analysisId)
      .populate("project", "name status technologyStack description")
      .populate("generatedBy", "name email role");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Manager AI review record not found",
      });
    }

    const devFindings = await DeveloperCodeFinding.find({
      projectAnalysis: analysis._id,
      developer: developerId,
    }).sort({ severity: 1, createdAt: -1 });

    const criticalCount = devFindings.filter((f) => f.severity === "CRITICAL").length;
    const highCount = devFindings.filter((f) => f.severity === "HIGH").length;

    res.status(200).json({
      success: true,
      review: {
        _id: analysis._id,
        project: analysis.project,
        analyzedBy: {
          _id: analysis.generatedBy?._id,
          name: analysis.generatedBy?.name || "Project Manager",
          role: analysis.generatedBy?.role || "Project Manager",
          email: analysis.generatedBy?.email,
        },
        analyzedAt: analysis.createdAt,
        overallQualityScore: analysis.overallQualityScore,
        healthStatus: analysis.healthStatus,
        submissionsAnalyzedCount: analysis.submissionsAnalyzedCount,
        developerIssuesCount: devFindings.length,
        criticalCount,
        highCount,
        findings: devFindings,
      },
    });
  } catch (error) {
    console.error("Get My Manager Review Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager review detail",
    });
  }
};

module.exports = {
  createCodeSubmission,
  getMyCodeSubmissions,
  getAllCodeSubmissions,
  getCodeSubmissionById,
  getProjectCodeSubmissions,
  analyzeSubmissionById,
  analyzeProjectOverall,
  getLatestProjectAnalysis,
  getMyCodeFindings,
  getProjectCodeFindings,
  getMyManagerReviews,
  getMyManagerReviewById,
};