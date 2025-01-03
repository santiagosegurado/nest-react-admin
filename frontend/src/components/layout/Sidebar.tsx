import { BookOpen, Home, LogOut, User, Users } from 'react-feather';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import UrbanoLogoWhite from '../../assets/urbano-logo-white.png';
import { LAST_VISITED_COURSE_KEY } from '../../constants/localStorage.constants';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/AuthService';
import LocalStorageService from '../../services/LocalStorageService';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  className: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const history = useHistory();

  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    setAuthenticatedUser(null);
    LocalStorageService.removeItem(LAST_VISITED_COURSE_KEY);
    history.push('/login');
  };

  return (
    <div className={'sidebar' + className}>
      <Link
        to="/"
        className="no-underline text-black flex items-center justify-center"
      >
        <img src={UrbanoLogoWhite} alt="" />
      </Link>
      <nav className="mt-5 flex flex-col gap-3 flex-grow">
        <SidebarItem to="/">
          <Home /> Dashboard
        </SidebarItem>
        <SidebarItem to="/courses">
          <BookOpen /> Courses
        </SidebarItem>
        {authenticatedUser.role === 'admin' ? (
          <SidebarItem to="/users">
            <Users /> Users
          </SidebarItem>
        ) : null}
        <SidebarItem to="/profile">
          <User /> Profile
        </SidebarItem>
      </nav>
      <button
        className="text-red-500 rounded-md p-3 transition-colors flex gap-3 justify-center items-center font-semibold focus:outline-none"
        onClick={handleLogout}
      >
        <LogOut /> Logout
      </button>
    </div>
  );
}
