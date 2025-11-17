import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Users from "./Users";

import Departments from "./Departments";

import Collections from "./Collections";

import UGC from "./UGC";

import Tasks from "./Tasks";

import Tickets from "./Tickets";

import Projects from "./Projects";

import LaunchCalendar from "./LaunchCalendar";

import MarketingDirectory from "./MarketingDirectory";

import SharedAssets from "./SharedAssets";

import AdminPanel from "./AdminPanel";

import Login from "./Login";

import Register from "./Register";

import ProtectedRoute from "@/components/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Users: Users,
    
    Departments: Departments,
    
    Collections: Collections,
    
    UGC: UGC,
    
    Tasks: Tasks,
    
    Tickets: Tickets,
    
    Projects: Projects,
    
    LaunchCalendar: LaunchCalendar,
    
    MarketingDirectory: MarketingDirectory,
    
    SharedAssets: SharedAssets,
    
    AdminPanel: AdminPanel,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/Dashboard" element={<Dashboard />} />
                            <Route path="/Users" element={<Users />} />
                            <Route path="/Departments" element={<Departments />} />
                            <Route path="/Collections" element={<Collections />} />
                            <Route path="/UGC" element={<UGC />} />
                            <Route path="/Tasks" element={<Tasks />} />
                            <Route path="/Tickets" element={<Tickets />} />
                            <Route path="/Projects" element={<Projects />} />
                            <Route path="/LaunchCalendar" element={<LaunchCalendar />} />
                            <Route path="/MarketingDirectory" element={<MarketingDirectory />} />
                            <Route path="/SharedAssets" element={<SharedAssets />} />
                            <Route path="/AdminPanel" element={<AdminPanel />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}