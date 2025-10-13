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

const Socials = ({mobile, additionalLinks}: {mobile: 'mobile' | 'desktop' | 'both', additionalLinks?: { icon: any; url: string; }[]}) => {

   const createSocialLinks = () => {
      return [...socialLinks, ...(additionalLinks || [])].map((link, index) => {
         return (
            <SocialLink key={index} icon={link.icon} redirectUrl={link.url} />
         )
      })
   }

   return (
      <div className={`ml-4 flex items-center gap-2 flex-wrap ${
         mobile === 'both'
         ? ''
         : mobile === 'mobile'
         ? 'min-[450px]:hidden'
         : 'max-[450px]:hidden'
      }`}>
         {createSocialLinks()}
      </div>
   )
};

export default Socials;
