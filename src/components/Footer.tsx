
import { Link } from "react-router-dom";
import { Church } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-youth-blue text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Church size={24} className="mr-2" />
              <h3 className="text-lg font-bold">44 JNR Youth</h3>
            </div>
            <p className="text-sm text-youth-light/80">
              Empowering young believers to grow in faith and community.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/sermons" className="text-sm hover:underline">Sermons</Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm hover:underline">Gallery</Link>
              </li>
              <li>
                <a href="#events" className="text-sm hover:underline">Events</a>
              </li>
              <li>
                <a href="#forum" className="text-sm hover:underline">Forum</a>
              </li>
              <li>
                <Link to="/admin-login" className="text-sm hover:underline font-semibold">Admin Access</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-bold mb-4">Contact Us</h4>
            <address className="not-italic">
              <p className="text-sm mb-1">123 Faith Street</p>
              <p className="text-sm mb-1">Nairobi, Kenya</p>
              <p className="text-sm mb-1">Email: info@44jnryouth.org</p>
              <p className="text-sm">Phone: +254 700 000000</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-youth-light/80 mb-2 md:mb-0">
            &copy; {currentYear} 44 JNR Youth. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-youth-light/80 hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm text-youth-light/80 hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
