import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
    const { user } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [projects, setProjects] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [tenantId, setTenantId] = useState(() => localStorage.getItem("gvc_tenant") || null);
    const [projectId, setProjectId] = useState(() => localStorage.getItem("gvc_project") || null);
    const [periodId, setPeriodId] = useState(() => localStorage.getItem("gvc_period") || null);

    useEffect(() => {
        if (!user) { setTenants([]); setProjects([]); setPeriods([]); return; }
        api.get("/tenants").then((r) => {
            setTenants(r.data);
            if (!tenantId && r.data[0]) {
                setTenantId(r.data[0].id);
                localStorage.setItem("gvc_tenant", r.data[0].id);
            }
        }).catch(() => {});
    }, [user]);

    useEffect(() => {
        if (!tenantId) return;
        api.get(`/projects?tenant_id=${tenantId}`).then((r) => {
            setProjects(r.data);
            if (!projectId && r.data[0]) {
                setProjectId(r.data[0].id);
                localStorage.setItem("gvc_project", r.data[0].id);
            }
        }).catch(() => {});
    }, [tenantId]);

    useEffect(() => {
        if (!projectId) { setPeriods([]); return; }
        api.get(`/periods?project_id=${projectId}`).then((r) => {
            setPeriods(r.data);
            if (!periodId && r.data[0]) {
                setPeriodId(r.data[0].id);
                localStorage.setItem("gvc_period", r.data[0].id);
            }
        }).catch(() => {});
    }, [projectId]);

    function pickTenant(id) { setTenantId(id); localStorage.setItem("gvc_tenant", id); setProjectId(null); setPeriodId(null); localStorage.removeItem("gvc_project"); localStorage.removeItem("gvc_period"); }
    function pickProject(id) { setProjectId(id); localStorage.setItem("gvc_project", id); setPeriodId(null); localStorage.removeItem("gvc_period"); }
    function pickPeriod(id) { setPeriodId(id); localStorage.setItem("gvc_period", id); }

    const tenant = tenants.find((t) => t.id === tenantId) || null;
    const project = projects.find((p) => p.id === projectId) || null;
    const period = periods.find((p) => p.id === periodId) || null;

    return (
        <TenantContext.Provider value={{
            tenants, projects, periods, tenantId, projectId, periodId,
            tenant, project, period,
            pickTenant, pickProject, pickPeriod,
        }}>{children}</TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
