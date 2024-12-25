import { ReactNode } from 'react';
import { ChevronRight } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  children: ReactNode;
  to: string;
  active?: boolean;
}

export default function SidebarItem({
  children,
  to,
  active = false,
}: SidebarItemProps) {
  const { pathname } = useLocation();

  return (
    <Link
      to={to}
      className={`no-underline text-white ${
        pathname === to && 'bg-brandPrimary'
      } hover:bg-brandPrimary rounded-md p-3 transition-colors`}
    >
      <span className="flex gap-5 font-semibold">
        {children} {active ? <ChevronRight /> : null}
      </span>
    </Link>
  );
}
