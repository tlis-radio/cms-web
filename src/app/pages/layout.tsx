import Header from '@/components/header'
import Footer from '@/components/footer'
import {isMobile, isTablet} from 'react-device-detect'

const PageLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <>
         <Header />
         <div className='bg-[#00ff00] flex flex-row justify-center w-full'>
            {// TODO make the width of the red div full when on mobile
            }
            <div className={`bg-[#ff0000] pt-4 w-2/3 text-center`}>
               {children}
            </div>
         </div>
         <Footer />
      </>
   );
};

export default PageLayout;
