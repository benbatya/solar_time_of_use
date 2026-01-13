
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

function App() {
    return (
        <Router>
            <DashboardLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </DashboardLayout>
        </Router>
    );
}

export default App;
