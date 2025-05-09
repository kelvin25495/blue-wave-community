
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, MessageSquare, Settings, Church, Book, Image, Users, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    navigate("/");
  };

  // We'll add a console log to help debug
  useEffect(() => {
    console.log("Navbar render - User:", user?.email);
    console.log("Navbar render - Is Admin:", isAdmin);
  }, [user, isAdmin]);

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
          {user && (
            <>
              <Link to="/sermons" className="hover:text-youth-light/80 transition-colors">Sermons</Link>
              <Link to="/gallery" className="hover:text-youth-light/80 transition-colors">Gallery</Link>
            </>
          )}
          <a href="#events" className="hover:text-youth-light/80 transition-colors">Events</a>
          <a href="#forum" className="hover:text-youth-light/80 transition-colors">Forum</a>
          {isAdmin && (
            <Link to="/admin" className="font-bold text-youth-light hover:text-youth-light/80 transition-colors">
              Admin Dashboard
            </Link>
          )}
        </div>
        
        <div className="hidden md:flex space-x-2">
          {user ? (
            <>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="bg-transparent border-white hover:bg-white hover:text-youth-blue"
                  onClick={() => navigate("/admin")}
                >
                  <Settings size={16} className="mr-2" />
                  Admin
                </Button>
              )}
              <Button 
                variant="outline" 
                className="bg-transparent border-white hover:bg-white hover:text-youth-blue"
                onClick={handleSignOut}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="bg-transparent border-white hover:bg-white hover:text-youth-blue"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button 
                className="bg-white text-youth-blue hover:bg-white/90"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </>
          )}
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
            <Link to="/" className="block py-2 hover:bg-white/10 px-3 rounded-md" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3">
                <Church size={20} />
                <span>Home</span>
              </div>
            </Link>
            
            {user && (
              <>
                <Link to="/sermons" className="block py-2 hover:bg-white/10 px-3 rounded-md" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <Book size={20} />
                    <span>Sermons</span>
                  </div>
                </Link>
                
                <Link to="/gallery" className="block py-2 hover:bg-white/10 px-3 rounded-md" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <Image size={20} />
                    <span>Gallery</span>
                  </div>
                </Link>
              </>
            )}
            
            <a href="#events" className="block py-2 hover:bg-white/10 px-3 rounded-md" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3">
                <Calendar size={20} />
                <span>Events</span>
              </div>
            </a>
            
            <a href="#forum" className="block py-2 hover:bg-white/10 px-3 rounded-md" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3">
                <MessageSquare size={20} />
                <span>Forum</span>
              </div>
            </a>
            
            {isAdmin && (
              <Link to="/admin" className="block py-2 hover:bg-white/10 px-3 rounded-md bg-white/10" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center space-x-3">
                  <Settings size={20} />
                  <span className="font-bold">Admin Dashboard</span>
                </div>
              </Link>
            )}
            
            {user ? (
              <Button 
                className="w-full justify-start bg-white text-youth-blue hover:bg-white/90"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            ) : (
              <>
                <Button 
                  className="w-full justify-start bg-white text-youth-blue hover:bg-white/90"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent border-white text-white hover:bg-white hover:text-youth-blue"
                  onClick={() => {
                    navigate("/register");
                    setIsMenuOpen(false);
                  }}
                >
                  Register
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent border-white text-white hover:bg-white hover:text-youth-blue"
                  onClick={() => {
                    navigate("/admin-login");
                    setIsMenuOpen(false);
                  }}
                >
                  Admin Login
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
