"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllAnalysesApi, runPromotionAnalysisApi } from "../../../services/api";

export default function PromotionDashboard() {
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [error, setError] = useState("");
  
  // Quick run state
  const [runEmpId, setRunEmpId] = useState("");
  const [runPeriod, setRunPeriod] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllAnalysesApi(filterPeriod, filterStatus);
      setAnalyses(res.data || []);
      setSummary(res.summary || {});
    } catch (err: any) {
      setError(err.message || "Failed to load promotion data");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runEmpId || !runPeriod) return;
    
    try {
      setRunning(true);
      await runPromotionAnalysisApi(parseInt(runEmpId), runPeriod);
      setRunEmpId("");
      fetchData(); // Refresh list
    } catch (err: any) {
      alert("Error running analysis: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promotion Analysis Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 font-medium">Strong Candidates</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.promotionReady || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Under Consideration</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.underConsideration || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-500 font-medium">Needs Development</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.needsDevelopment || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-300">
          <p className="text-sm text-gray-500 font-medium">Total Evaluations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500 font-medium">Avg Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.averageScore || "0.0"}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Period</label>
            <input 
              type="text" 
              placeholder="e.g. Q3-2026"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PROMOTION_READY">Strong Candidate</option>
              <option value="UNDER_CONSIDERATION">Consider</option>
              <option value="NEEDS_DEVELOPMENT">Development Required</option>
            </select>
          </div>
        </div>

        {/* Quick Run Form */}
        <form onSubmit={handleRunAnalysis} className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">Employee ID (Int)</label>
            <input 
              type="number" required
              className="w-32 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={runEmpId} onChange={(e) => setRunEmpId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">Period</label>
            <input 
              type="text" required placeholder="Q3-2026"
              className="w-32 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={runPeriod} onChange={(e) => setRunPeriod(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={running}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {running ? "Running..." : "Run Engine"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engine Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HR Decision</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading analysis data...</td></tr>
            ) : analyses.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No promotion analyses found.</td></tr>
            ) : (
              analyses.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{row.employee?.firstName} {row.employee?.lastName}</div>
                    <div className="text-sm text-gray-500">ID: {row.employeeId} • {row.evaluationPeriod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{row.employee?.department || "N/A"}</div>
                    <div className="text-sm text-gray-500">{row.employee?.designation || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xl font-semibold text-gray-800">{row.promotionScore}</span>
                    <span className="text-sm text-gray-500 ml-1">/ 100</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${row.promotionStatus === 'PROMOTION_READY' ? 'bg-green-100 text-green-800' : 
                        row.promotionStatus === 'UNDER_CONSIDERATION' ? 'bg-blue-100 text-blue-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {row.promotionStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.scoreChange !== null ? (
                      <span className={`text-sm font-medium flex items-center ${parseFloat(row.scoreChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(row.scoreChange) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(row.scoreChange))}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">First evaluation</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium 
                      ${row.hrDecision === 'APPROVED' ? 'text-green-600' : 
                        row.hrDecision === 'REJECTED' ? 'text-red-600' : 
                        row.hrDecision === 'DEFERRED' ? 'text-orange-600' : 'text-gray-500'}`}>
                      {row.hrDecision}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/promotion/${row.id}`} className="text-blue-600 hover:text-blue-900 font-semibold bg-blue-50 px-3 py-1 rounded">
                      View Detail &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
