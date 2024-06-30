const Footer = () => {
   return (
      <footer className='bg-gray-400 flex flex-row justify-center h-full w-full p-4'>
         <div className='flex items-right'>
            <p className="font-sans">FOOTER</p>
         </div>
         <div className="flex items-left">
            {/* Later we'll use an API by Maps themselves and generate an API key to make it dark mode to fit with the entire design */}
            <iframe
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2661.4736417528934!2d17.061515476123528!3d48.15895204967321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476ad7fc4f2e1433%3A0x797172435adcd5cf!2sRadio%20TLIS!5e0!3m2!1ssk!2ssk!4v1719235378608!5m2!1ssk!2ssk"
               width="400"
               height="300"
               style={{ border: "0" }}
               loading="lazy"
               referrerPolicy="no-referrer-when-downgrade"
               className="rounded-lg">
            </iframe>
         </div>
      </footer>
   )
}
export default Footer;