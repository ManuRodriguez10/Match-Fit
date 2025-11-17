import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Events from "./Events";

import Roster from "./Roster";

import Lineups from "./Lineups";

import TeamSettings from "./TeamSettings";

import LandingPage from "./LandingPage";

import Profile from "./Profile";

import PlayerRoster from "./PlayerRoster";

import CoachProfile from "./CoachProfile";

import Login from "./Login";

import Signup from "./Signup";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Events: Events,
    
    Roster: Roster,
    
    Lineups: Lineups,
    
    TeamSettings: TeamSettings,
    
    LandingPage: LandingPage,
    
    Profile: Profile,
    
    PlayerRoster: PlayerRoster,
    
    CoachProfile: CoachProfile,
    
    Login: Login,
    
    Signup: Signup,
    
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
    return pageName || "LandingPage";
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<LandingPage />} />
                
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/Signup" element={<Signup />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Roster" element={<Roster />} />
                
                <Route path="/Lineups" element={<Lineups />} />
                
                <Route path="/TeamSettings" element={<TeamSettings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/PlayerRoster" element={<PlayerRoster />} />
                
                <Route path="/CoachProfile" element={<CoachProfile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}