import Navbar from '@/components/navbar'

const ManagementLayout = ({ children, }: { children: React.ReactNode }) => {
   return (
      <>
         <Navbar />
         <div className='bg-[#00ff00] flex flex-row justify-center h-full w-full'>
            <div className='bg-[#ff0000] p-4 w-full md:w-3/4 xl-custom:w-2/4 mx-1 sm:mx-0'>
               {children}
            </div>
         </div>
      </>
   );
};

export default ManagementLayout;
