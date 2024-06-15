import { FunctionComponent } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SocialLinkProps = {
   icon: IconProp,
   redirectUrl: string
}

const SocialLink: FunctionComponent<SocialLinkProps> = ({ icon, redirectUrl }) => {
   return(
      <a target='_blank' className='flex h-8 w-8 items-center text-white border-2 rounded-3xl p-1' href={redirectUrl}>
         <FontAwesomeIcon icon={icon} />
      </a>
   )
}

export default SocialLink;