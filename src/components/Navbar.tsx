
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, MessageSquare, Settings, Church } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-youth-blue text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Church size={28} />
          <span className="text-xl font-bold">44 JNR Youth</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-youth-light/80 transition-colors">Home</Link>
          <a href="#events" className="hover:text-youth-light/80 transition-colors">Events</a>
          <a href="#forum" className="hover:text-youth-light/80 transition-colors">Forum</a>
          <Link to="/admin-login" className="hover:text-youth-light/80 transition-colors">Admin</Link>
        </div>
        
        <div className="hidden md:block">
          <Button variant="outline" className="bg-transparent border-white hover:bg-white hover:text-youth-blue">
            Sign In
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-youth-blue border-t border-white/20 animate-slide-in">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link to="/" className="block py-2 hover:bg-white/10 px-3 rounded-md">
              <div className="flex items-center space-x-3">
                <Church size={20} />
                <span>Home</span>
              </div>
            </Link>
            <a href="#events" className="block py-2 hover:bg-white/10 px-3 rounded-md">
              <div className="flex items-center space-x-3">
                <Calendar size={20} />
                <span>Events</span>
              </div>
            </a>
            <a href="#forum" className="block py-2 hover:bg-white/10 px-3 rounded-md">
              <div className="flex items-center space-x-3">
                <MessageSquare size={20} />
                <span>Forum</span>
              </div>
            </a>
            <Link to="/admin-login" className="block py-2 hover:bg-white/10 px-3 rounded-md">
              <div className="flex items-center space-x-3">
                <Settings size={20} />
                <span>Admin</span>
              </div>
            </Link>
            <Button className="w-full bg-white text-youth-blue hover:bg-white/90">
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
