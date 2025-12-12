import React, { useState } from 'react';
import { Menu, X, Home, Coins, Users, Settings, LogOut } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import StakingGovernance from './components/StakingGovernance';
import AdminDashboard from './components/AdminDashboard';
import styles from './AppLayout.module.css';

type PageType = 'landing' | 'dashboard' | 'staking' | 'admin' | 'tokens' | 'settings';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'super_admin'>('user');

  const navItems: NavItem[] = [
    {
      id: 'landing',
      label: 'Home',
      icon: <Home size={20} />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Coins size={20} />,
      requiresAuth: true,
    },
    {
      id: 'staking',
      label: 'Staking',
      icon: <Coins size={20} />,
      requiresAuth: true,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Users size={20} />,
      requiresAuth: true,
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: <Settings size={20} />,
      requiresAuth: true,
    },
  ];

  const handlePageChange = (page: PageType) => {
    if (page !== 'landing' && !isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const handleConnect = () => {
    setIsConnected(true);
    setCurrentPage('dashboard');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'staking':
        return <StakingGovernance />;
      case 'admin':
        return <AdminDashboard contractFunctions={[]} />;
      case 'dashboard':
      case 'tokens':
      case 'settings':
      default:
        return (
          <div className={styles.placeholderPage}>
            <h1>Coming Soon</h1>
            <p>This page is under development</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.appLayout}>
      {/* Global Navigation */}
      {currentPage !== 'landing' && (
        <nav className={styles.topNav}>
          <div className={styles.navContainer}>
            <div className={styles.logo}>
              <Coins className={styles.logoIcon} />
              <span>CROZZ</span>
            </div>

            {/* Desktop Menu */}
            <div className={styles.desktopMenu}>
              {navItems.map((item) => {
                if (item.requiresAuth && !isConnected) return null;
                return (
                  <button
                    key={item.id}
                    className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
                    onClick={() => handlePageChange(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info & Connect Button */}
            <div className={styles.authSection}>
              {isConnected ? (
                <div className={styles.userInfo}>
                  <div className={styles.roleTag}>
                    {userRole === 'super_admin' && '👑 Super Admin'}
                    {userRole === 'admin' && '🔑 Admin'}
                    {userRole === 'user' && '👤 User'}
                  </div>
                  <button
                    className={styles.disconnectButton}
                    onClick={handleDisconnect}
                  >
                    <LogOut size={18} />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <button
                  className={styles.connectButton}
                  onClick={handleConnect}
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={styles.mobileMenu}>
              {navItems.map((item) => {
                if (item.requiresAuth && !isConnected) return null;
                return (
                  <button
                    key={item.id}
                    className={`${styles.mobileMenuItem} ${currentPage === item.id ? styles.active : ''}`}
                    onClick={() => handlePageChange(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      )}

      {/* Page Content */}
      <main className={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
};

export default AppLayout;
