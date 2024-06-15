import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFacebook, faInstagram, faSpotify, faYoutube} from "@fortawesome/free-brands-svg-icons";

const Navbar = () => {
   return (
      <nav className='bg-cyan-500 flex flex-row justify-between h-full w-full p-4'>
         <div className='bg-black flex p-1 text-white'>TLIS</div>
         Navbar
         <div className='bg-black flex p-1 gap-3'>
            <a className='flex w-8 text-white border rounded-3xl p-1' href="https://www.facebook.com/radiotlis/">
            <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a className='flex w-8 text-white border rounded-3xl p-1' href="https://www.instagram.com/radiotlis/">
            <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a className='flex w-8 text-white border rounded-3xl p-1' href="https://open.spotify.com/user/wskoqdo1mcisldwdvmzgj8bvf?si=e6b0940811194b4e">
            <FontAwesomeIcon icon={faSpotify} />
            </a>
            <a className='flex w-8 text-white border rounded-3xl p-1' href="https://www.youtube.com/@radiotlis">
            <FontAwesomeIcon icon={faYoutube} />
            </a>
         </div>
      </nav>
   )
}
export default Navbar;