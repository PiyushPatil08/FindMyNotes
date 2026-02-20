import { Link } from "react-router-dom";
import { logo } from "../config/assets";

const Footer = () => (
  <footer className="w-full bg-white border-t border-gray-100 py-8 mt-8">
    <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      {/* Logo and Copyright */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="FindMyNotes Logo" className="h-10 w-10 rounded-full shadow" />
        <span className="text-xl font-heading font-extrabold text-blue-700 tracking-wide">FindMyNotes</span>
        <span className="text-gray-400 text-sm ml-2">&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
      {/* Footer Links */}
      <div className="flex gap-6 mt-2 md:mt-0 font-cta">
        <Link to="/about" className="text-blue-700 font-cta font-medium rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition">About</Link>
        <Link to="/faq" className="text-blue-700 font-cta font-medium rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition">FAQ</Link>
        <Link to="/contact" className="text-blue-700 font-cta font-medium rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition">Contact</Link>
      </div>
      {/* Social Icons */}
      <div className="flex gap-4 mt-4 md:mt-0 flex-wrap justify-center md:justify-start">
        <a href="#" className="text-blue-400 hover:text-blue-600 transition-colors rounded-full p-2 bg-blue-50 hover:bg-blue-100" aria-label="Twitter">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.1.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 012 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 006.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0024 4.59a8.36 8.36 0 01-2.54.7z" /></svg>
        </a>
        <a href="#" className="text-blue-400 hover:text-blue-600 transition-colors rounded-full p-2 bg-blue-50 hover:bg-blue-100" aria-label="LinkedIn">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
        </a>
        <a href="#" className="text-blue-400 hover:text-blue-600 transition-colors rounded-full p-2 bg-blue-50 hover:bg-blue-100" aria-label="Instagram">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07c-1.276.058-2.15.24-2.91.51-.8.28-1.48.66-2.15 1.33-.67.67-1.05 1.35-1.33 2.15-.27.76-.452 1.634-.51 2.91C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.276.24 2.15.51 2.91.28.8.66 1.48 1.33 2.15.67.67 1.35 1.05 2.15 1.33.76.27 1.634.452 2.91.51C8.332 23.988 8.736 24 12 24c3.264 0 3.668-.012 4.948-.07 1.276-.058 2.15-.24 2.91-.51.8-.28 1.48-.66 2.15-1.33.67-.67 1.05-1.35 1.33-2.15.27-.76.452-1.634.51-2.91.058-1.28.07-1.684.07-4.948 0-3.264-.012-3.668-.07-4.948-.058-1.276-.24-2.15-.51-2.91-.28-.8-.66-1.48-1.33-2.15-.67-.67-1.35-1.05-2.15-1.33-.76-.27-1.634-.452-2.91-.51C15.668.012 15.264 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm7.844-10.406a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" /></svg>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
