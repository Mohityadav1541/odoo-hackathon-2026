"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, checkInApi, checkOutApi, getEmployeeDashboardApi, getAdminDashboardApi, applyLeaveApi, updateLeaveStatusApi, getMyPayrollApi, updateSalaryStructureApi, generatePayrollApi } from "../services/api";

export type Role = "employee" | "admin";

export interface EmployeeRecord {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "present" | "absent" | "half-day" | "on-leave";
  checkIn?: string;
  checkOut?: string;
  hours?: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  address?: string;
  documents?: { name: string; size: string; date: string; }[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  type: "Paid Leave" | "Sick Leave" | "Casual Leave" | "Unpaid Leave";
  startDate: string;
  endDate: string;
  days: number;
  remarks: string;
  status: "pending" | "approved" | "rejected";
  rejectComment?: string;
  appliedDate: string;
}

export interface AttendanceDay {
  day: string; // e.g. Mon, Tue
  date: string;
  status: "present" | "half-day" | "absent" | "weekend";
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
  type: "info" | "success" | "warning" | "danger";
  targetRole?: "employee" | "admin" | "all";
  link?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: "success" | "danger" | "warning" | "info";
}

export interface PayslipItem {
  id: string;
  month: string;
  gross: number;
  deductions: number;
  net: number;
  status: "Paid" | "Processing";
  issuedDate: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  department: string;
  status: "In Progress" | "Completed" | "Planning";
  description: string;
  progress: number;
  manager?: string;
  managerAvatar?: string;
  deadline?: string;
  budget?: string;
  tasks: { id?: string; title?: string; status: string; assignedTo?: string; }[];
  team: { id: string; avatar: string; name: string; role: string }[];
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;

  // Profile
  userProfile: EmployeeRecord;
  updateUserProfile: (data: Partial<EmployeeRecord>) => void;

  // Attendance & Check-in
  isCheckedIn: boolean;
  checkInTime: string | null;
  todayHours: number;
  toggleCheckIn: () => void;
  weeklyAttendance: AttendanceDay[];
  allAttendanceLogs: EmployeeRecord[];

  // Leave Management
  leaveRequests: LeaveRequest[];
  leaveBalances: { paid: number; sick: number; unpaid: string };
  applyForLeave: (req: Omit<LeaveRequest, "id" | "employeeId" | "employeeName" | "employeeAvatar" | "status" | "appliedDate">) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string, comment: string) => void;

  // Employee Directory
  employees: EmployeeRecord[];
  updateEmployeeSalary: (id: string, salary: { basicSalary: number; hra: number; allowances: number; deductions: number }) => void;
  addEmployee: (data: any) => void;

  // Reports
  fiveYearSalaryReports?: any[];

  // Payroll
  payslips: PayslipItem[];
  generateBatchPayslips: () => void;

  // Projects
  projects: ProjectItem[];

  login: (email: string, pass: string) => Promise<boolean>;
  signup: (empId: string, email: string, pass: string, role?: string) => Promise<boolean>;
  logout: () => void;
  fetchDashboardData: (currentRole?: Role) => Promise<void>;
  isLoadingDashboard: boolean;

  // Notifications & Toasts
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  toasts: ToastItem[];
  addToast: (title: string, message?: string, type?: "success" | "danger" | "warning" | "info") => void;
  removeToast: (id: string) => void;

  // Quick settings
  quickSettings: { emailAlerts: boolean; autoCheckIn: boolean };
  toggleQuickSetting: (setting: "emailAlerts" | "autoCheckIn") => void;

  // Navigation search term
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const initialEmployees: EmployeeRecord[] = [
  {
    id: "EMP-1001",
    name: "Alex Morgan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Senior UX Designer",
    department: "Design & Product",
    email: "alex.morgan@dayflow.hr",
    phone: "+1 (555) 234-5678",
    status: "present",
    checkIn: "09:02 AM",
    checkOut: "--:--",
    hours: 5.5,
    basicSalary: 4500,
    hra: 1800,
    allowances: 700,
    deductions: 400,
  },
  {
    id: "EMP-1002",
    name: "Devon Lane",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Frontend Engineer",
    department: "Engineering",
    email: "devon.lane@dayflow.hr",
    phone: "+1 (555) 876-5432",
    status: "present",
    checkIn: "08:55 AM",
    checkOut: "--:--",
    hours: 5.8,
    basicSalary: 5200,
    hra: 2000,
    allowances: 800,
    deductions: 500,
  },
  {
    id: "EMP-1003",
    name: "Courtney Henry",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "HR Specialist",
    department: "Human Resources",
    email: "courtney.h@dayflow.hr",
    phone: "+1 (555) 345-6789",
    status: "half-day",
    checkIn: "09:30 AM",
    checkOut: "01:30 PM",
    hours: 4.0,
    basicSalary: 4000,
    hra: 1600,
    allowances: 500,
    deductions: 350,
  },
  {
    id: "EMP-1004",
    name: "Robert Fox",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Backend Architect",
    department: "Engineering",
    email: "robert.fox@dayflow.hr",
    phone: "+1 (555) 901-2345",
    status: "absent",
    checkIn: "--:--",
    checkOut: "--:--",
    hours: 0,
    basicSalary: 6000,
    hra: 2400,
    allowances: 1000,
    deductions: 600,
  },
  {
    id: "EMP-1005",
    name: "Arlene McCoy",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Product Manager",
    department: "Design & Product",
    email: "arlene.mccoy@dayflow.hr",
    phone: "+1 (555) 654-3210",
    status: "on-leave",
    checkIn: "--:--",
    checkOut: "--:--",
    hours: 0,
    basicSalary: 5500,
    hra: 2200,
    allowances: 900,
    deductions: 550,
  },
];

const initialLeaves: LeaveRequest[] = [
  {
    id: "LR-301",
    employeeId: "EMP-1005",
    employeeName: "Arlene McCoy",
    employeeAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    type: "Paid Leave",
    startDate: "2026-08-22",
    endDate: "2026-08-25",
    days: 3,
    remarks: "Attending annual design conference and workshops.",
    status: "pending",
    appliedDate: "2026-08-20",
  },
  {
    id: "LR-302",
    employeeId: "EMP-1003",
    employeeName: "Courtney Henry",
    employeeAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    type: "Sick Leave",
    startDate: "2026-08-18",
    endDate: "2026-08-19",
    days: 2,
    remarks: "Seasonal flu and medical rest.",
    status: "approved",
    appliedDate: "2026-08-17",
  },
  {
    id: "LR-303",
    employeeId: "EMP-1004",
    employeeName: "Robert Fox",
    employeeAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Casual Leave",
    startDate: "2026-08-12",
    endDate: "2026-08-12",
    days: 1,
    remarks: "Personal appointment.",
    status: "rejected",
    rejectComment: "High sprint backlog release scheduled for August 12.",
    appliedDate: "2026-08-10",
  },
];

const initialProjects: ProjectItem[] = [
  {
    id: "PRJ-101",
    title: "HRMS Portal Redesign",
    department: "Design & Product",
    status: "In Progress",
    description: "Revamping the internal HRMS portal with a modern UI and improved UX.",
    progress: 65,
    manager: "Alex Morgan",
    managerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    deadline: "2026-10-15",
    budget: "$45,000",
    tasks: [{ status: "completed" }, { status: "pending" }],
    team: [
      { id: "1", name: "Alex Morgan", role: "Lead", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "2", name: "Devon Lane", role: "Dev", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
    ]
  },
  {
    id: "PRJ-102",
    title: "Q3 Performance Reviews",
    department: "Human Resources",
    status: "Planning",
    description: "Preparation for Q3 company-wide performance reviews and feedback cycles.",
    progress: 15,
    manager: "Courtney Henry",
    managerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    deadline: "2026-09-30",
    budget: "$12,000",
    tasks: [{ status: "pending" }],
    team: [
      { id: "3", name: "Courtney Henry", role: "HR", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
    ]
  }
];

const initialFiveYearSalaryReports = [
  { year: 2026, totalGross: 350000, totalDeductions: 50000, totalNetPaid: 300000, avgEmployeeSalary: 60000, headcount: 5, growthRate: "+12%" },
  { year: 2025, totalGross: 320000, totalDeductions: 45000, totalNetPaid: 275000, avgEmployeeSalary: 55000, headcount: 5, growthRate: "+10%" },
  { year: 2024, totalGross: 290000, totalDeductions: 40000, totalNetPaid: 250000, avgEmployeeSalary: 50000, headcount: 5, growthRate: "+9%" },
  { year: 2023, totalGross: 265000, totalDeductions: 35000, totalNetPaid: 230000, avgEmployeeSalary: 46000, headcount: 5, growthRate: "+11%" },
  { year: 2022, totalGross: 240000, totalDeductions: 30000, totalNetPaid: 210000, avgEmployeeSalary: 42000, headcount: 5, growthRate: "+8%" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>("employee");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [fiveYearSalaryReports] = useState(initialFiveYearSalaryReports);

  // Employee details
  const [userProfile, setUserProfile] = useState<EmployeeRecord>(initialEmployees[0]);

  // Check-in state
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState<string | null>("09:02 AM");
  const [todayHours, setTodayHours] = useState(5.5);

  const [weeklyAttendance, setWeeklyAttendance] = useState<AttendanceDay[]>([
    { day: "Mon", date: "Aug 18", status: "present", checkIn: "08:58 AM", checkOut: "05:30 PM", hoursWorked: 8.5 },
    { day: "Tue", date: "Aug 19", status: "present", checkIn: "09:05 AM", checkOut: "05:45 PM", hoursWorked: 8.6 },
    { day: "Wed", date: "Aug 20", status: "half-day", checkIn: "09:15 AM", checkOut: "01:30 PM", hoursWorked: 4.2 },
    { day: "Thu", date: "Aug 21", status: "present", checkIn: "09:00 AM", checkOut: "05:30 PM", hoursWorked: 8.5 },
    { day: "Fri", date: "Aug 22", status: "present", checkIn: "09:02 AM", checkOut: "--:--", hoursWorked: 5.5 },
    { day: "Sat", date: "Aug 23", status: "weekend" },
    { day: "Sun", date: "Aug 24", status: "weekend" },
  ]);

  const [employees, setEmployees] = useState<EmployeeRecord[]>(initialEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaves);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  const [leaveBalances, setLeaveBalances] = useState({
    paid: 8,
    sick: 5,
    unpaid: "Unlimited",
  });

  const [payslips, setPayslips] = useState<PayslipItem[]>([
    { id: "PAY-2026-07", month: "July 2026", gross: 7000, deductions: 400, net: 6600, status: "Paid", issuedDate: "Jul 31, 2026" },
    { id: "PAY-2026-06", month: "June 2026", gross: 7000, deductions: 400, net: 6600, status: "Paid", issuedDate: "Jun 30, 2026" },
    { id: "PAY-2026-05", month: "May 2026", gross: 6800, deductions: 380, net: 6420, status: "Paid", issuedDate: "May 31, 2026" },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "1", title: "Project Suggestion Added", message: "Devon Lane added a suggestion to HRMS Portal Redesign.", timestamp: "10 mins ago", isUnread: true, type: "info", targetRole: "all", link: "/projects/PRJ-101" },
    { id: "2", title: "Payslip Available", message: "July 2026 payslip is ready for download.", timestamp: "2 hours ago", isUnread: true, type: "success", targetRole: "all" },
    { id: "3", title: "Policy Update", message: "Updated remote work guideline posted in company portal.", timestamp: "Yesterday", isUnread: false, type: "info", targetRole: "all" },
    { id: "4", title: "New Leave Application", message: "Devon Lane has applied for 2 days of sick leave.", timestamp: "1 hour ago", isUnread: true, type: "warning", targetRole: "admin" },
    { id: "5", title: "Pending Onboarding", message: "You have 1 pending document verification for a new employee.", timestamp: "4 hours ago", isUnread: false, type: "info", targetRole: "admin" },
  ]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Quick settings state initialized with localStorage support
  const [quickSettings, setQuickSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickSettings");
      if (saved) return JSON.parse(saved);
    }
    return { emailAlerts: true, autoCheckIn: false };
  });

  const toggleRole = () => {
    const next = role === "employee" ? "admin" : "employee";
    setRole(next);
    addToast(`Switched view to ${next === "admin" ? "Admin / HR" : "Employee"}`, "Permissions and navigation updated.", "info");
  };

  const addToast = (title: string, message?: string, type: "success" | "danger" | "warning" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserProfile = (data: Partial<EmployeeRecord>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
    addToast("Profile updated successfully", "Your personal details have been saved.", "success");
  };

  const fetchDashboardData = async (currentRole = role) => {
    setIsLoadingDashboard(true);
    try {
      if (currentRole === "admin") {
        const res = await getAdminDashboardApi();
        if (res.success) {
          setEmployees(res.data.employees);
          setLeaveRequests(res.data.pendingLeaves);
        }
      } else {
        const res = await getEmployeeDashboardApi();
        const payrollRes = await getMyPayrollApi();
        
        if (res.success) {
          setUserProfile(res.data.userProfile);
          setWeeklyAttendance(res.data.weeklyAttendance);
          setLeaveRequests(res.data.leaveRequests);
          
          const isPresent = res.data.userProfile.status === "present" || res.data.userProfile.status === "half-day";
          setIsCheckedIn(isPresent);
          setCheckInTime(res.data.userProfile.checkIn !== "--:--" ? res.data.userProfile.checkIn : null);
          setTodayHours(res.data.userProfile.hours || 0);

          // AUTO CHECK-IN LOGIC
          if (!isPresent && quickSettings.autoCheckIn) {
            setTimeout(async () => {
              addToast("Office WiFi Detected", "Simulating connection to Corporate Network...", "info");
              
              setTimeout(async () => {
                const empId = localStorage.getItem("demo_empId") || "EMP001";
                const pass = localStorage.getItem("demo_pass") || "password123";
                try {
                  await checkInApi(empId, pass);
                  setIsCheckedIn(true);
                  setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  addToast("Auto Checked In", "Automatically punched in via Office WiFi", "success");
                } catch (error: any) {
                  // Fallback for mock if DB fails
                  setIsCheckedIn(true);
                  setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  addToast("Auto Checked In (Mock)", "Automatically punched in via Office WiFi", "success");
                }
              }, 1500);
            }, 500);
          }
        }
        
        if (payrollRes && payrollRes.success) {
          setPayslips(payrollRes.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const login = async (empId: string, pass: string) => {
    try {
      const res = await loginApi(empId, pass);
      if (res.success) {
        localStorage.setItem("demo_empId", empId);
        localStorage.setItem("demo_pass", pass);
        localStorage.setItem("authToken", res.token);
        
        const backendRole = res.user?.role === "ADMIN" ? "admin" : "employee";
        setRole(backendRole);
        
        // Fetch real data right after login
        await fetchDashboardData(backendRole);

        addToast("Signed in successfully", "Welcome back!", "success");
        return true;
      }
      throw new Error(res.message || "Invalid credentials");
    } catch (error: any) {
      throw error;
    }
  };

  const signup = async (empId: string, email: string, pass: string, role?: string) => {
    try {
      const res = await signupApi(empId, email, pass, role);
      if (res.success) {
        addToast("Account created successfully", "Please sign in.", "success");
        return true;
      }
      return false;
    } catch (error: any) {
      addToast("Sign Up Failed", error.message || "Could not create account", "danger");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("demo_empId");
    localStorage.removeItem("demo_pass");
    localStorage.removeItem("authToken");
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  const toggleCheckIn = async () => {
    const empId = localStorage.getItem("demo_empId") || "EMP001";
    const pass = localStorage.getItem("demo_pass") || "password123";

    if (isCheckedIn) {
      try {
        await checkOutApi(empId, pass);
        setIsCheckedIn(false);
        addToast("Checked Out", "Workday ended at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "warning");
      } catch (error: any) {
        // Fallback for demo when DB is down
        setIsCheckedIn(false);
        addToast("Checked Out (Mock - DB Error)", error.message, "warning");
      }
    } else {
      try {
        const res = await checkInApi(empId, pass);
        setIsCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        addToast("Checked In", "Have a productive day!", "success");
      } catch (error: any) {
        // Fallback for demo when DB is down
        setIsCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        addToast("Checked In (Mock - DB Error)", error.message, "warning");
      }
    }
  };

  const applyForLeave = async (req: Omit<LeaveRequest, "id" | "employeeId" | "employeeName" | "employeeAvatar" | "status" | "appliedDate">) => {
    try {
      const res = await applyLeaveApi({
        type: req.type,
        startDate: req.startDate,
        endDate: req.endDate,
        remarks: req.remarks || "",
      });
      if (res.success) {
        addToast("Leave applied successfully", "Your request is pending HR approval.", "success");
        await fetchDashboardData(); // Refresh the data!
      }
    } catch (error: any) {
      // Fallback for demo when DB is down
      const newLeave: LeaveRequest = {
        id: "LR-" + Math.floor(Math.random() * 1000),
        employeeId: userProfile.id,
        employeeName: userProfile.name,
        employeeAvatar: userProfile.avatar,
        type: req.type,
        startDate: req.startDate,
        endDate: req.endDate,
        days: 1, // simplified
        remarks: req.remarks || "",
        status: "pending",
        appliedDate: new Date().toISOString().split('T')[0],
      };
      setLeaveRequests(prev => [newLeave, ...prev]);
      addToast("Leave Applied (Mock)", "Your request is pending HR approval.", "success");
    }
  };

  const approveLeave = async (id: string) => {
    try {
      const res = await updateLeaveStatusApi(id, 'APPROVED');
      if (res.success) {
        addToast("Leave Approved", `Request ${id} has been approved.`, "success");
        await fetchDashboardData(); // Refresh to remove it from the pending list
      }
    } catch (error: any) {
      // Fallback for demo when DB is down
      setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
      addToast("Leave Approved (Mock)", `Request ${id} has been approved locally.`, "success");
    }
  };

  const rejectLeave = async (id: string, comment: string) => {
    try {
      const res = await updateLeaveStatusApi(id, 'REJECTED', comment);
      if (res.success) {
        addToast("Leave Rejected", `Request ${id} has been rejected.`, "danger");
        await fetchDashboardData(); // Refresh to remove it from the pending list
      }
    } catch (error: any) {
      // Fallback for demo when DB is down
      setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', rejectComment: comment } : l));
      addToast("Leave Rejected (Mock)", `Request ${id} has been rejected locally.`, "warning");
    }
  };

  const updateEmployeeSalary = async (id: string, salary: { basicSalary: number; hra: number; allowances: number; deductions: number }) => {
    try {
      const res = await updateSalaryStructureApi(id, salary);
      if (res.success) {
        addToast("Salary Structure Saved", `Salary details updated for ${id}.`, "success");
        await fetchDashboardData("admin"); // Refresh admin employee list
      }
    } catch (error: any) {
      addToast("Failed to update salary", error.message, "danger");
    }
  };

  const addEmployee = (data: any) => {
    addToast("Employee Added", "Mock employee added.", "success");
  };

  const generateBatchPayslips = async () => {
    try {
      const date = new Date();
      const res = await generatePayrollApi(date.getMonth() + 1, date.getFullYear());
      if (res.success) {
        addToast("Batch Payslips Generated", res.message, "success");
        await fetchDashboardData(); // Refresh if we are an admin or employee? Usually admin clicks it
      }
    } catch (error: any) {
      addToast("Failed to generate payslips", error.message, "danger");
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    addToast("Notifications Cleared", "All alerts marked as read.", "info");
  };

  const toggleQuickSetting = (setting: "emailAlerts" | "autoCheckIn") => {
    setQuickSettings((prev: any) => {
      const nextSettings = { ...prev, [setting]: !prev[setting] };
      if (typeof window !== "undefined") {
        localStorage.setItem("quickSettings", JSON.stringify(nextSettings));
      }
      return nextSettings;
    });
    addToast("Setting Updated", `${setting} is now ${!quickSettings[setting] ? "ON" : "OFF"}`, "info");
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        userProfile,
        updateUserProfile,
        isCheckedIn,
        checkInTime,
        todayHours,
        toggleCheckIn,
        weeklyAttendance,
        allAttendanceLogs: employees,
        leaveRequests,
        leaveBalances,
        applyForLeave,
        approveLeave,
        rejectLeave,
        employees,
        updateEmployeeSalary,
        addEmployee,
        payslips,
        generateBatchPayslips,
        projects,
        fiveYearSalaryReports,
        notifications,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
        quickSettings,
        toggleQuickSetting,
        searchTerm,
        setSearchTerm,
        login,
        signup,
        logout,
        fetchDashboardData,
        isLoadingDashboard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
