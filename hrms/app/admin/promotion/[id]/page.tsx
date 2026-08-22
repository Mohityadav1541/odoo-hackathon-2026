"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAnalysisByIdApi, updateHrDecisionApi } from "../../../../services/api";

export default function PromotionAnalysisDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // HR Decision state
  const [decision, setDecision] = useState("PENDING");
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getAnalysisByIdApi(parseInt(id as string));
      setData(res.data);
      setDecision(res.data.hrDecision || "PENDING");
      setComments(res.data.hrComments || "");
    } catch (err: any) {
      setError(err.message || "Failed to load detail");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDecision = async () => {
    try {
      setSaving(true);
      await updateHrDecisionApi(parseInt(id as string), decision as any, comments);
      alert("Decision saved successfully");
      fetchDetail();
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading analysis detail...</div>;
  if (error) return <div className="p-10 text-red-600 bg-red-50 m-10 rounded-lg">{error}</div>;
  if (!data) return <div className="p-10">Data not found</div>;

  const emp = data.employee;

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-800">
      <Link href="/admin/promotion" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {emp.firstName} {emp.lastName}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {emp.designation} • {emp.department} • Evaluation Period: {data.evaluationPeriod}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-blue-700">{data.promotionScore}</div>
          <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Final Score</div>
          <div className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-bold
            ${data.promotionStatus === 'PROMOTION_READY' ? 'bg-green-100 text-green-800' : 
              data.promotionStatus === 'UNDER_CONSIDERATION' ? 'bg-blue-100 text-blue-800' : 
              'bg-orange-100 text-orange-800'}`}>
            {data.promotionStatus.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Factor Breakdown & AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
            
            <div className="space-y-4">
              <FactorRow label="Attendance & Reliability" score={data.attendanceScore} />
              <FactorRow label="Performance Review" score={data.performanceScore} />
              <FactorRow label="Project Delivery" score={data.projectScore} />
              <FactorRow label="Manager Feedback" score={data.managerFeedbackScore} />
              <FactorRow label="Peer Feedback" score={data.peerFeedbackScore} />
              <FactorRow label="Experience & Tenure" score={data.experienceScore} />
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              Weights are dynamically applied based on the active HR policy at calculation time. 
              The engine guarantees normalization to 100 maximum.
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-indigo-900">Gemini HR Insights</h2>
            </div>
            
            {data.aiSummary ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-2">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{data.aiSummary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">Top Strengths</h3>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{data.aiStrengths}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-2">Areas for Review / Risks</h3>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{data.aiRisks}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-2">Suggested HR Actions</h3>
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">{data.aiRecommendation}</div>
                </div>
                
                <p className="text-xs text-indigo-400 italic">
                  Note: This explanation is generated by AI based on verified metrics. The final promotion decision belongs entirely to HR.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No AI insights generated for this evaluation.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Supporting Evidence</h2>
            <ul className="space-y-3">
              <li><Link href="#" className="text-blue-600 hover:underline flex items-center gap-2">📄 View {data.evaluationPeriod} Performance Reviews</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline flex items-center gap-2">🎯 View Project & Goal Records</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline flex items-center gap-2">💬 View Manager Feedback Forms</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline flex items-center gap-2">👥 View 360° Peer Reviews</Link></li>
              <li><Link href="#" className="text-blue-600 hover:underline flex items-center gap-2">📅 View Attendance Summary</Link></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Profile & HR Action */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Employee ID</span><span className="font-medium">{emp.user?.employeeId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joining Date</span><span className="font-medium">{new Date(emp.joiningDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Job Level</span><span className="font-medium">{emp.jobLevel || "L1"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Experience Yrs</span><span className="font-medium">{emp.experience?.yearsAtCompany || "0"}</span></div>
              {data.scoreChange && (
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-500">Trend (vs prev)</span>
                  <span className={`font-bold ${parseFloat(data.scoreChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(data.scoreChange) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(data.scoreChange))} pts
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">HR Decision</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision Status</label>
                <select 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-2"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved for Promotion Review</option>
                  <option value="DEFERRED">Development Plan / Deferred</option>
                  <option value="REJECTED">No Action</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Comments</label>
                <textarea 
                  rows={4}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
                  placeholder="Notes regarding the decision..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
              </div>

              <button 
                onClick={handleSaveDecision}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Record Decision"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable component for factor rows
function FactorRow({ label, score }: { label: string, score: string | number }) {
  const numericScore = parseFloat(score as string);
  const colorClass = numericScore >= 80 ? 'bg-green-500' : numericScore >= 60 ? 'bg-blue-500' : 'bg-orange-500';
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{numericScore.toFixed(1)} <span className="text-gray-400 font-normal">/ 100</span></span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${numericScore}%` }}></div>
      </div>
    </div>
  );
}
