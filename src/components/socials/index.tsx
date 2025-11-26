import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import SocialLink from './social-link';
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Custom playlist icon definition
export const CustomPlaylistIcon1: IconDefinition = {
   icon: [
      24, // width
      24, // height
      [], // ligatures
      "e001", // unicode

      // SVG path data for the playlist icon
      "M2.25 6C2.25 5.58579 2.58579 5.25 3 5.25H21C21.4142 5.25 21.75 5.58579 21.75 6C21.75 6.41421 21.4142 6.75 21 6.75H3C2.58579 6.75 2.25 6.41421 2.25 6ZM2.25 10C2.25 9.58579 2.58579 9.25 3 9.25H21C21.4142 9.25 21.75 9.58579 21.75 10C21.75 10.4142 21.4142 10.75 21 10.75H3C2.58579 10.75 2.25 10.4142 2.25 10ZM2.25 14C2.25 13.5858 2.58579 13.25 3 13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H3C2.58579 14.75 2.25 14.4142 2.25 14ZM2.25 18C2.25 17.5858 2.58579 17.25 3 17.25H11C11.4142 17.25 11.75 17.5858 11.75 18C11.75 18.4142 11.4142 18.75 11 18.75H3C2.58579 18.75 2.25 18.4142 2.25 18Z M18.875 14.1184C20.5288 15.0733 21.3558 15.5507 21.4772 16.2395C21.5076 16.4118 21.5076 16.5882 21.4772 16.7605C21.3558 17.4493 20.5288 17.9267 18.875 18.8816C17.2212 19.8364 16.3942 20.3138 15.737 20.0746C15.5725 20.0148 15.4199 19.9266 15.2858 19.8141C14.75 19.3645 14.75 18.4097 14.75 16.5C14.75 14.5903 14.75 13.6355 15.2858 13.1859C15.4199 13.0734 15.5725 12.9852 15.737 12.9254C16.3942 12.6862 17.2212 13.1636 18.875 14.1184Z"
   ],
   prefix: "fas",
   iconName: "function"
};

// Custom playlist icon definition
export const CustomPlaylistIcon2: IconDefinition = {
   icon: [
      450, // width
      450, // height
      [], // ligatures
      "e001", // unicode
      
      // SVG path data for the playlist icon
      "M336 359.8c39.1-32.3 64-81.1 64-135.8 0-97.2-78.8-176-176-176S48 126.8 48 224C48 278.7 72.9 327.5 112 359.8 112.4 377.4 115.2 400.2 118.4 421.6 48 383.9 0 309.5 0 224 0 100.3 100.3 0 224 0S448 100.3 448 224c0 85.6-48 159.9-118.5 197.6 3.3-21.4 6-44.2 6.4-61.8zm-14-53.4c-8.3-12.6-19.2-21.6-30.4-27.8-2.1-1.1-4.2-2.2-6.3-3.2 11.7-13.9 18.8-31.9 18.8-51.5 0-44.2-35.8-80-80-80s-80 35.8-80 80c0 19.6 7.1 37.6 18.8 51.5-2.1 1-4.2 2-6.3 3.2-11.2 6.2-22.1 15.2-30.4 27.8-18.8-22.3-30.1-51-30.1-82.4 0-70.7 57.3-128 128-128s128 57.3 128 128c0 31.4-11.3 60.2-30.1 82.4zM224 312c32.9 0 64 8.6 64 43.8 0 33-12.9 104.1-20.6 132.9-5.1 19-24.5 23.4-43.4 23.4s-38.2-4.4-43.4-23.4c-7.8-28.5-20.6-99.7-20.6-132.8 0-35.1 31.1-43.8 64-43.8zm0-128a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
   ],
   prefix: "fas",
   iconName: "function"
};

export const socialLinks = [
   { 
      icon: CustomPlaylistIcon1, 
      url: "https://radia.sk/radia/tlis/playlist"
   },
   { 
      icon: faInstagram, 
      url: "https://www.instagram.com/radiotlis/"
   },
   { 
      icon: faFacebook, 
      url: "https://www.facebook.com/radiotlis/"
   },
   { 
      icon: CustomPlaylistIcon2, 
      url: "https://open.spotify.com/show/5SVWFMvATF72lHPQqCQQ3l"
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
         ? 'min-[500px]:hidden'
         : 'max-[500px]:hidden ml-auto'
      }`}>
         {createSocialLinks()}
      </div>
   )
};

export default Socials;
