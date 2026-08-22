import React, { useState } from "react";
import { ModalDrawer } from "./ModalDrawer";
import { FormFieldSet } from "./FormFieldSet";
import { useApp } from "@/context/AppContext";

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewEmployeeModal({ isOpen, onClose }: NewEmployeeModalProps) {
  const { addEmployee } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [phone, setPhone] = useState("");
  const [basicSalary, setBasicSalary] = useState<number>(0);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const docs = [];
    if (panFile) docs.push({ name: panFile.name, size: (panFile.size / 1024).toFixed(0) + " KB", date: today });
    if (aadharFile) docs.push({ name: aadharFile.name, size: (aadharFile.size / 1024).toFixed(0) + " KB", date: today });
    if (bankFile) docs.push({ name: bankFile.name, size: (bankFile.size / 1024).toFixed(0) + " KB", date: today });

    addEmployee({
      name,
      email,
      role,
      department,
      phone,
      basicSalary,
      hra: basicSalary * 0.4,
      allowances: basicSalary * 0.1,
      deductions: basicSalary * 0.05,
      avatar: avatarFile ? URL.createObjectURL(avatarFile) : "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random",
      status: "present",
      checkIn: "--:--",
      checkOut: "--:--",
      hours: 0,
      documents: docs.length > 0 ? docs : undefined,
    });

    // Reset form
    setName("");
    setEmail("");
    setRole("");
    setDepartment("Engineering");
    setPhone("");
    setBasicSalary(0);
    setAvatarFile(null);
    setPanFile(null);
    setAadharFile(null);
    setBankFile(null);
    
    onClose();
  };

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      subtitle="Manually create a new employee record in the system."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormFieldSet label="Full Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Jane Doe"
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          />
        </FormFieldSet>
        <FormFieldSet label="Email Address" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="jane.doe@dayflow.hr"
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          />
        </FormFieldSet>
        <FormFieldSet label="Role / Job Title" required>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="e.g. Frontend Developer"
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          />
        </FormFieldSet>
        <FormFieldSet label="Department">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          >
            <option value="Engineering">Engineering</option>
            <option value="Design & Product">Design & Product</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Operations">Operations</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
          </select>
        </FormFieldSet>
        <FormFieldSet label="Phone Number">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          />
        </FormFieldSet>
        <FormFieldSet label="Basic Salary ($/month)">
          <input
            type="number"
            value={basicSalary || ""}
            onChange={(e) => setBasicSalary(Number(e.target.value))}
            placeholder="e.g. 5000"
            className="w-full px-3.5 py-2 bg-white rounded-lg border border-[#ECEBF7] text-xs text-[#2B2A45] placeholder-[#9C9AB8] focus:outline-none focus:border-[#4f45ba] focus:ring-2 focus:ring-[#EEEDFE]"
          />
        </FormFieldSet>
        
        <div className="pt-2">
          <h3 className="text-sm font-medium text-[#2B2A45] mb-2">Profile & Documents</h3>
          <div className="space-y-3">
            <FormFieldSet label="Profile Picture (Optional)">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#8583A6] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#EEEDFE] file:text-[#4f45ba] hover:file:bg-[#4f45ba] hover:file:text-white transition-colors"
              />
            </FormFieldSet>
            <FormFieldSet label="PAN Card (PDF/Image)">
              <input
                type="file"
                onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#8583A6] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#EEEDFE] file:text-[#4f45ba] hover:file:bg-[#4f45ba] hover:file:text-white transition-colors"
              />
            </FormFieldSet>
            <FormFieldSet label="Aadhar Card (PDF/Image)">
              <input
                type="file"
                onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#8583A6] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#EEEDFE] file:text-[#4f45ba] hover:file:bg-[#4f45ba] hover:file:text-white transition-colors"
              />
            </FormFieldSet>
            <FormFieldSet label="Bank Details (PDF/Image)">
              <input
                type="file"
                onChange={(e) => setBankFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#8583A6] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#EEEDFE] file:text-[#4f45ba] hover:file:bg-[#4f45ba] hover:file:text-white transition-colors"
              />
            </FormFieldSet>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ECEBF7]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#ECEBF7] rounded-lg text-xs font-medium text-[#8583A6] hover:bg-[#F4F3FB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4f45ba] hover:bg-[#4038a3] text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            Save Employee
          </button>
        </div>
      </form>
    </ModalDrawer>
  );
}
