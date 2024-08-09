import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

type NavbarLinkProps = {
  title: string;
  to: string;
};

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ title, to }) => {
  return (
    <span className="font-semibold tracking-wide text-white">
      <Link to={to}>{title}</Link>
    </span>
  );
};

export default NavbarLink;