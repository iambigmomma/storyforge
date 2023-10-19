import { faBrain, faShieldHalved, faSnowflake, faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import logo from '../../public/storyforge-logo.png'

export const Logo = () => {
  return (
    <div className="py-4 text-3xl text-center font-heading">
      <Image
        src={logo}
        width={200}
        height={200}
        alt="logo"
        className="pt-4 mx-auto"
      />
      <span className="text-center">StoryForge</span>
    </div>
  )
};
