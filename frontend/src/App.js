import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/context/TenantContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";
import Visits from "@/pages/Visits";
import VisitExecute from "@/pages/VisitExecute";
import Forms from "@/pages/Forms";
import Evaluations from "@/pages/Evaluations";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import Clients from "@/pages/Clients";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import Projects from "@/pages/Projects";
import Shoppers from "@/pages/Shoppers";
import Postulations from "@/pages/Postulations";

function Shell({ children }) {
    return (
        <ProtectedRoute>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}

function App() {
    return (
        <AuthProvider>
            <TenantProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Shell><Dashboard /></Shell>} />
                        <Route path="/projects" element={<Shell><Projects /></Shell>} />
                        <Route path="/campaigns" element={<Shell><Campaigns /></Shell>} />
                        <Route path="/campaigns/:id" element={<Shell><CampaignDetail /></Shell>} />
                        <Route path="/visits" element={<Shell><Visits /></Shell>} />
                        <Route path="/visits/:id" element={<Shell><VisitExecute /></Shell>} />
                        <Route path="/postulations" element={<Shell><Postulations /></Shell>} />
                        <Route path="/shoppers" element={<Shell><Shoppers /></Shell>} />
                        <Route path="/forms" element={<Shell><Forms /></Shell>} />
                        <Route path="/evaluations" element={<Shell><Evaluations /></Shell>} />
                        <Route path="/reports" element={<Shell><Reports /></Shell>} />
                        <Route path="/documents" element={<Shell><DocumentAnalysis /></Shell>} />
                        <Route path="/users" element={<Shell><Users /></Shell>} />
                        <Route path="/clients" element={<Shell><Clients /></Shell>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Toaster />
                </BrowserRouter>
            </TenantProvider>
        </AuthProvider>
    );
}

export default App;
