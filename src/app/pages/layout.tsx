import Header from '@/components/header'
import Footer from '@/components/footer'

const ManagementLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <>
         <Header />
         <div className='bg-[#00ff00] flex flex-row justify-center w-full'>
            <div className='bg-[#ff0000] p-4 w-3/4 text-center'>
               {children}
            </div>
         </div>
         <Footer />
      </>
   );
};

export default ManagementLayout;
