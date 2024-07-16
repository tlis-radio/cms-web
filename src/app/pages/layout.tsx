/**
 * If 
 * * isMobile and isTablet 
 * are used, you need to add
 * * 'use client'; 
 * cause the module needs to know the users device
 * - Jizzus 10:48 7.7.2024
 */

'use client'; 

import Header from '@/components/header'
import Footer from '@/components/footer'
import Background from '../../../public/images/bgimage.png'
import Image from 'next/image'

const PageLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <>
         <Header />
         <div className='flex flex-row justify-center w-full'>
            <div className='absolute -z-10 w-full'>
               <Image src={Background} alt='bg-image' className='w-full'/>
            </div>
            <div className='bg-[#ff0000] pt-4 w-full text-center sm:w-3/4 md:w-2/3 2xl:w-1/2'>
               {children}
            </div>
         </div>
         <Footer />
      </>
   );
};

export default PageLayout;
