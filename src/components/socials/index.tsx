
import { faFacebook, faInstagram, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';
import SocialLink from './social-link';

const socialLinks = [
   { 
      icon: faFacebook, 
      url: "https://www.facebook.com/radiotlis/"
   },
   { 
      icon: faInstagram, 
      url: "https://www.instagram.com/radiotlis/"
   },
   { 
      icon: faSpotify, 
      url: "https://open.spotify.com/user/wskoqdo1mcisldwdvmzgj8bvf?si=e6b0940811194b4e"
   },
   { 
      icon: faYoutube, 
      url: "https://www.youtube.com/@radiotlis"
   }
];

const Socials = () => {

   const createSocialLinks = () => {
      return socialLinks.map((link, index) => {
         return (
            <SocialLink key={index} icon={link.icon} redirectUrl={link.url} />
         )
      })
   }

   return (
      <div className='bg-[#681B22] flex p-1 gap-2'>
         {createSocialLinks()}
      </div>
   )
};

export default Socials;
