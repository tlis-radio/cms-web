import { FunctionComponent } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SocialLinkProps = {
   icon: IconProp,
   redirectUrl: string
}

const SocialLink: FunctionComponent<SocialLinkProps> = ({ icon, redirectUrl }) => {
   return(
      <a target='_blank' className='flex h-11 w-11 items-center text-white border-2 rounded-3xl p-[6px] hover:text-[#96120F] hover:bg-white transition-colors' href={redirectUrl}>
         <FontAwesomeIcon icon={icon} />
      </a>
   )
}

export default SocialLink;