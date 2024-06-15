import SocialLinks from "./socials";

const Header = () => {
   return (
      <nav className='bg-cyan-500 flex flex-row justify-between h-full w-full p-4'>
         <div className='bg-black flex p-1 text-white'>TLIS</div>
         Header
         <SocialLinks/>
      </nav>
   )
}
export default Header;