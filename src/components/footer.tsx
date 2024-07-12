import dynamic from 'next/dynamic';

const Lazymap = dynamic(() => import("./map"), {
   ssr: false,
   //loading: () => <p>Loading...</p>,
});

const Footer = () => {
   return (
      <footer className='bg-gray-400 flex flex-row justify-center h-full w-full p-4'>
         <Lazymap />
      </footer>
   )
}
export default Footer;