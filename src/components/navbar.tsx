import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import {} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
   return (
      <nav className='bg-cyan-500 flex flex-row justify-center h-full w-full p-4'>
         <div className='bg-black flex p-1 text-white'>TLIS</div>
         Navbar
         <div className='bg-black flex p-1'>
            <a className='flex w-5 text-white border rounded-xl' href="https://www.facebook.com/radiotlis/">
            <FontAwesomeIcon icon={'facebook-f'} />
            </a>
            <a className='flex w-5 text-white border rounded-xl' href="https://www.instagram.com/radiotlis/">
            <FontAwesomeIcon icon={'instagram'} />
            </a>
            <a className='flex w-5 text-white border rounded-xl' href="https://open.spotify.com/user/wskoqdo1mcisldwdvmzgj8bvf?si=e6b0940811194b4e">
            <FontAwesomeIcon icon={'spotify'} />
            </a>
            <a className='flex w-5 text-white border rounded-xl' href="https://www.youtube.com/@radiotlis">
            <FontAwesomeIcon icon={'youtube'} />
            </a>
         </div>
      </nav>
   )
}
export default Navbar;