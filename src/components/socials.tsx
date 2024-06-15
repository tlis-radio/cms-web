import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';

const socialLinks = [
   { href: "https://www.facebook.com/radiotlis/", icon: faFacebook },
   { href: "https://www.instagram.com/radiotlis/", icon: faInstagram },
   { href: "https://open.spotify.com/user/wskoqdo1mcisldwdvmzgj8bvf?si=e6b0940811194b4e", icon: faSpotify },
   { href: "https://www.youtube.com/@radiotlis", icon: faYoutube }
];

const SocialLinks = () => (
   <div className='bg-black flex p-1 gap-2'>
      {socialLinks.map((link, index) => (
         <a key={index} target='_blank' className='flex h-8 w-8 items-center text-white border-2 rounded-3xl p-1' href={link.href}>
            <FontAwesomeIcon icon={link.icon} />
         </a>
      ))}
   </div>
);

export default SocialLinks;
