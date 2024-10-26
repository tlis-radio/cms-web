import { faFacebook, faInstagram, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';
import SocialLink from './social-link';

export const socialLinks = [
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
      <div className='bg-[#96120F] flex items-center gap-2 max-[450px]:hidden'>
         {createSocialLinks()}
      </div>
   )
};

export default Socials;
