import NavbarLink from "./nav-link";

const Navbar = () => {
   return (
      <div className="bg-green-500">
         <NavbarLink to={"main"} title={"Program"} />
         <NavbarLink to={"relacie"} title={"Relácie"} />
      </div>
   )
}
export default Navbar;