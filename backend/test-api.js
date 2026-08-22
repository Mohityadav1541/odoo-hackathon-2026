import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function runTests() {
    console.log("=== API Integration Test Started ===");
    try {
        // 1. Admin Login
        console.log("1. Logging in as Admin (EMP002)...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            employeeId: 'EMP002',
            password: 'demo1234'
        });
        const token = loginRes.data.token;
        console.log("✅ Admin Login Successful");

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Fetch Admin Dashboard
        console.log("2. Fetching Admin Dashboard...");
        const dashRes = await axios.get(`${API_URL}/dashboard/admin`, { headers });
        const employees = dashRes.data.data.employees;
        const targetEmp = employees.find(e => e.id === 'EMP001');
        console.log(`✅ Admin Dashboard fetched. Found ${employees.length} employees.`);
        console.log(`   Initial Salary for EMP001: Basic: $${targetEmp.basicSalary}, Net: $${targetEmp.basicSalary + targetEmp.hra + targetEmp.allowances - targetEmp.deductions}`);

        // 3. Update Salary for EMP001
        console.log("3. Updating Salary Structure for EMP001...");
        const updateRes = await axios.put(`${API_URL}/payroll/salary-structure/EMP001`, {
            basicSalary: 60000,
            hra: 15000,
            allowances: 5000,
            deductions: 2000
        }, { headers });
        console.log(`✅ Salary updated successfully! API returned status: ${updateRes.status}`);

        // 4. Fetch Admin Dashboard Again
        console.log("4. Verifying Dashboard Data...");
        const dashRes2 = await axios.get(`${API_URL}/dashboard/admin`, { headers });
        const updatedEmp = dashRes2.data.data.employees.find(e => e.id === 'EMP001');
        
        console.log(`   Updated Salary for EMP001: Basic: $${updatedEmp.basicSalary}, HRA: $${updatedEmp.hra}`);
        if (updatedEmp.basicSalary === 60000) {
            console.log("✅ Verified! Data correctly pulled from Database relation.");
        } else {
            console.error("❌ Verification failed. Salary not mapped properly.");
        }

        console.log("=== API Integration Test Completed Successfully ===");

    } catch (error) {
        console.error("❌ Test failed:", error.response ? error.response.data : error.message);
    }
}

runTests();
