import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SeekerDashboard from './pages/SeekerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import Pricing from './pages/Pricing';
import Sectors from './pages/Sectors';
import AdminDashboard from './pages/AdminDashboard';
import Cars from './pages/Cars';
import RealEstate from './pages/RealEstate';
import Services from './pages/Services';
import CarPlates from './pages/CarPlates';
import { trackPageView, seedVisitsIfEmpty } from './utils/analytics';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

export default function App() {
  useEffect(() => { seedVisitsIfEmpty(); }, []);

  return (
    <AuthProvider>
      <ApplicationsProvider>
        <BrowserRouter>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
            <Route path="/jobs/:id" element={<Layout><JobDetail /></Layout>} />
            <Route path="/sectors" element={<Layout><Sectors /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/post-job" element={<Layout><ProtectedRoute roles={['company']}><PostJob /></ProtectedRoute></Layout>} />
            <Route path="/dashboard/seeker" element={<Layout><ProtectedRoute roles={['seeker']}><SeekerDashboard /></ProtectedRoute></Layout>} />
            <Route path="/dashboard/company" element={<Layout><ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute></Layout>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/cars" element={<Layout><Cars /></Layout>} />
            <Route path="/real-estate" element={<Layout><RealEstate /></Layout>} />
            <Route path="/services" element={<Layout><Services /></Layout>} />
            <Route path="/car-plates" element={<Layout><CarPlates /></Layout>} />
          </Routes>
        </BrowserRouter>
      </ApplicationsProvider>
    </AuthProvider>
  );
}
