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

const PageLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <div className='bg-acoustic-foam min-h-[100vh] flex flex-col bg-center'>
         <Header />
         <div className='flex flex-row justify-center w-full'>
            {
               // bg-[#00ff00] - green
               // bg-[#ff0000] - red
            }
            <div className='pt-4 w-full text-center md:w-3/4 xl:w-2/3 2xl:w-1/2'>
               {children}
            </div>
         </div>
         <Footer />
      </div>
   );
};

export default PageLayout;


/* -------------------------------------------------------------------------- */
/*                                 2. version                                 */
/* -------------------------------------------------------------------------- */

/**
'use client'; 

import Header from '@/components/header'
import Footer from '@/components/footer'

const PageLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <div className='bg-acoustic-foam min-h-[100vh] flex flex-col bg-repeat-y bg-center bg-contain'>
         <Header />
         <div className='flex flex-row justify-center w-full'>
            {
               // bg-[#00ff00] - green
               // bg-[#ff0000] - red
            }
            <div className='pt-4 w-full text-center md:w-3/4 xl:w-2/3 2xl:w-1/2'>
               {children}
            </div>
         </div>
         <Footer />
      </div>
   );
};

export default PageLayout;
*/