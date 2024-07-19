import dynamic from 'next/dynamic';

const Lazymap = dynamic(() => import("./map"), {
   ssr: false,
   //loading: () => <p>Loading...</p>,
});

const Footer = () => {
   return (
      <footer className='bg-[#111111] flex flex-row justify-center h-full w-full p-4 mt-auto'>
         <Lazymap />
      </footer>
   )
}
export default Footer;