"use client";

import React, { createContext, useContext, useState } from "react";

export type Role = "employee" | "admin";

export interface EmployeeDocument {
  name: string;
  size: string;
  date: string;
}

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
  documents?: EmployeeDocument[];
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

export interface ProjectTask {
  id: string;
  title: string;
  assignedTo: string;
  status: "completed" | "in-progress" | "todo";
}

export interface ProjectItem {
  id: string;
  title: string;
  department: string;
  manager: string;
  managerAvatar: string;
  progress: number;
  deadline: string;
  status: "In Progress" | "Completed" | "Planning" | "On Hold";
  description: string;
  team: { id: string; name: string; role: string; avatar: string }[];
  tasks: ProjectTask[];
  budget: string;
}

export interface YearlySalaryReport {
  year: number;
  totalGross: number;
  totalDeductions: number;
  totalNetPaid: number;
  avgEmployeeSalary: number;
  headcount: number;
  growthRate: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;

  // Profile
  userProfile: EmployeeRecord;
  setUserProfile: (profile: EmployeeRecord) => void;
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
  addEmployee: (emp: Omit<EmployeeRecord, "id">) => void;
  updateEmployeeSalary: (id: string, salary: { basicSalary: number; hra: number; allowances: number; deductions: number }) => void;

  // Payroll
  payslips: PayslipItem[];
  generateBatchPayslips: () => void;

  // Notifications & Toasts
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  toasts: ToastItem[];
  addToast: (title: string, message?: string, type?: "success" | "danger" | "warning" | "info") => void;
  removeToast: (id: string) => void;

  // Quick settings
  quickSettings: { emailAlerts: boolean; autoCheckIn: boolean };
  toggleQuickSetting: (setting: "emailAlerts" | "autoCheckIn") => void;

  // Projects Module
  projects: ProjectItem[];

  // 5-Year Salary Reports
  fiveYearSalaryReports: YearlySalaryReport[];

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
    title: "Odoo HRMS Engine Integration",
    department: "Engineering",
    manager: "Courtney Henry",
    managerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    progress: 78,
    deadline: "Sep 30, 2026",
    status: "In Progress",
    budget: "$45,000",
    description: "Building standalone Next.js HRMS frontend wired to Odoo JSON-RPC/REST backend endpoints.",
    team: [
      { id: "EMP-1001", name: "Alex Morgan", role: "Senior UX Designer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "EMP-1002", name: "Devon Lane", role: "Frontend Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "EMP-1004", name: "Robert Fox", role: "Backend Architect", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    ],
    tasks: [
      { id: "TSK-1", title: "Implement Odoo JSON-RPC authentication adapter", assignedTo: "Robert Fox", status: "completed" },
      { id: "TSK-2", title: "Design responsive sidebar & dashboard cards", assignedTo: "Alex Morgan", status: "completed" },
      { id: "TSK-3", title: "Wire attendance check-in endpoints to hr.attendance", assignedTo: "Devon Lane", status: "in-progress" },
      { id: "TSK-4", title: "Conduct end-to-end integration testing", assignedTo: "Devon Lane", status: "todo" },
    ],
  },
  {
    id: "PRJ-102",
    title: "Mobile App Redesign (iOS & Android)",
    department: "Design & Product",
    manager: "Arlene McCoy",
    managerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    progress: 45,
    deadline: "Oct 15, 2026",
    status: "In Progress",
    budget: "$32,000",
    description: "Revamping native mobile app experience for self-service attendance, leave applications, and push notifications.",
    team: [
      { id: "EMP-1001", name: "Alex Morgan", role: "Senior UX Designer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "EMP-1005", name: "Arlene McCoy", role: "Product Manager", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    ],
    tasks: [
      { id: "TSK-10", title: "Complete Mobile UI Figma wireframes", assignedTo: "Alex Morgan", status: "completed" },
      { id: "TSK-11", title: "React Native component library setup", assignedTo: "Alex Morgan", status: "in-progress" },
      { id: "TSK-12", title: "Push notification push relay server", assignedTo: "Arlene McCoy", status: "todo" },
    ],
  },
  {
    id: "PRJ-103",
    title: "AI Facial Recognition Attendance Scanner",
    department: "Engineering",
    manager: "Robert Fox",
    managerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    progress: 100,
    deadline: "Aug 01, 2026",
    status: "Completed",
    budget: "$28,000",
    description: "Automated kiosk-based facial recognition check-in for physical office entry points.",
    team: [
      { id: "EMP-1004", name: "Robert Fox", role: "Backend Architect", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { id: "EMP-1002", name: "Devon Lane", role: "Frontend Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    ],
    tasks: [
      { id: "TSK-20", title: "Train OpenCV facial detection model", assignedTo: "Robert Fox", status: "completed" },
      { id: "TSK-21", title: "Deploy kiosk hardware units to SF & NYC offices", assignedTo: "Devon Lane", status: "completed" },
    ],
  },
  {
    id: "PRJ-104",
    title: "Cloud Infrastructure & Compliance Migration",
    department: "Human Resources",
    manager: "Courtney Henry",
    managerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    progress: 20,
    deadline: "Nov 30, 2026",
    status: "Planning",
    budget: "$50,000",
    description: "Migrating HR database and document repositories to SOC2 Type II compliant cloud vault.",
    team: [
      { id: "EMP-1003", name: "Courtney Henry", role: "HR Specialist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
      { id: "EMP-1004", name: "Robert Fox", role: "Backend Architect", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    ],
    tasks: [
      { id: "TSK-30", title: "Audit security & data privacy compliance", assignedTo: "Courtney Henry", status: "in-progress" },
      { id: "TSK-31", title: "DB encryption at rest implementation", assignedTo: "Robert Fox", status: "todo" },
    ],
  },
];

const initialFiveYearSalaryReports: YearlySalaryReport[] = [
  { year: 2026, totalGross: 340000, totalDeductions: 22200, totalNetPaid: 317800, avgEmployeeSalary: 68000, headcount: 5, growthRate: "+8.5%" },
  { year: 2025, totalGross: 312000, totalDeductions: 20400, totalNetPaid: 291600, avgEmployeeSalary: 62400, headcount: 5, growthRate: "+12.1%" },
  { year: 2024, totalGross: 278000, totalDeductions: 18200, totalNetPaid: 259800, avgEmployeeSalary: 55600, headcount: 5, growthRate: "+10.3%" },
  { year: 2023, totalGross: 245000, totalDeductions: 15900, totalNetPaid: 229100, avgEmployeeSalary: 49000, headcount: 5, growthRate: "+14.0%" },
  { year: 2022, totalGross: 210000, totalDeductions: 13600, totalNetPaid: 196400, avgEmployeeSalary: 42000, headcount: 5, growthRate: "Baseline" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>("employee");
  const [searchTerm, setSearchTerm] = useState("");

  // Employee details
  const [userProfile, setUserProfile] = useState<EmployeeRecord>(initialEmployees[0]);

  // Check-in state
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState<string | null>("09:02 AM");
  const [todayHours, setTodayHours] = useState(5.5);

  const [weeklyAttendance] = useState<AttendanceDay[]>([
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
    { id: "1", title: "Leave Request Submitted", message: "Your paid leave request for Aug 25-27 is under review.", timestamp: "10 mins ago", isUnread: true, type: "info" },
    { id: "2", title: "Payslip Available", message: "July 2026 payslip is ready for download.", timestamp: "2 hours ago", isUnread: true, type: "success" },
    { id: "3", title: "Policy Update", message: "Updated remote work guideline posted in company portal.", timestamp: "Yesterday", isUnread: false, type: "info" },
  ]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [quickSettings, setQuickSettings] = useState({ emailAlerts: true, autoCheckIn: false });

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

  const toggleCheckIn = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      addToast("Checked Out", "Workday ended at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "warning");
    } else {
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      addToast("Checked In", "Have a productive day, Alex!", "success");
    }
  };

  const applyForLeave = (req: Omit<LeaveRequest, "id" | "employeeId" | "employeeName" | "employeeAvatar" | "status" | "appliedDate">) => {
    const newReq: LeaveRequest = {
      ...req,
      id: "LR-" + Math.floor(100 + Math.random() * 900),
      employeeId: userProfile.id,
      employeeName: userProfile.name,
      employeeAvatar: userProfile.avatar,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };
    setLeaveRequests((prev) => [newReq, ...prev]);

    // Update balance
    if (req.type === "Paid Leave") {
      setLeaveBalances((prev) => ({ ...prev, paid: Math.max(0, prev.paid - req.days) }));
    } else if (req.type === "Sick Leave") {
      setLeaveBalances((prev) => ({ ...prev, sick: Math.max(0, prev.sick - req.days) }));
    }

    addToast("Leave Application Submitted", `Requested ${req.days} day(s) of ${req.type}.`, "success");
  };

  const approveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "approved" as const } : l))
    );
    addToast("Leave Approved", `Request #${id} marked as approved.`, "success");
  };

  const rejectLeave = (id: string, comment: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "rejected" as const, rejectComment: comment } : l))
    );
    addToast("Leave Rejected", `Request #${id} rejected with feedback.`, "danger");
  };

  const updateEmployeeSalary = (id: string, salary: { basicSalary: number; hra: number; allowances: number; deductions: number }) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...salary } : e))
    );
    addToast("Salary Structure Saved", `Salary details updated for ${id}.`, "success");
  };

  const addEmployee = (emp: Omit<EmployeeRecord, "id">) => {
    const newId = `EMP-${1000 + employees.length + 1}`;
    setEmployees((prev) => [{ ...emp, id: newId }, ...prev]);
    addToast("Employee Added", `${emp.name} has been added to the directory.`, "success");
  };

  const generateBatchPayslips = () => {
    const newPayslip: PayslipItem = {
      id: `PAY-2026-08`,
      month: "August 2026",
      gross: userProfile.basicSalary + userProfile.hra + userProfile.allowances,
      deductions: userProfile.deductions,
      net: userProfile.basicSalary + userProfile.hra + userProfile.allowances - userProfile.deductions,
      status: "Paid",
      issuedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setPayslips((prev) => [newPayslip, ...prev]);
    addToast("Batch Payslips Generated", "August 2026 payslips issued to all employees.", "success");
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    addToast("Notifications Cleared", "All alerts marked as read.", "info");
  };

  const toggleQuickSetting = (setting: "emailAlerts" | "autoCheckIn") => {
    setQuickSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
    addToast("Setting Updated", `${setting} is now ${!quickSettings[setting] ? "ON" : "OFF"}`, "info");
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        userProfile,
        setUserProfile,
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
        addEmployee,
        updateEmployeeSalary,
        payslips,
        generateBatchPayslips,
        notifications,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
        quickSettings,
        toggleQuickSetting,
        projects: initialProjects,
        fiveYearSalaryReports: initialFiveYearSalaryReports,
        searchTerm,
        setSearchTerm,
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
