/** 
 * import dynamic from 'next/dynamic';
 * const Lazymap = dynamic(() => import("./map"), {
 * ssr: false,
 * loading: () => <p>Loading...</p>,
 * });
*/

const Footer = () => {
   return (
      <footer className='bg-[#111111] text-white flex flex-row justify-center h-full w-full p-4 mt-auto'>
         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, architecto praesentium obcaecati suscipit voluptatem corrupti sint accusantium vero, quos enim excepturi quibusdam ipsam officiis? Eaque rem dolor quos placeat error.</p>
      </footer>
   )
}
export default Footer;