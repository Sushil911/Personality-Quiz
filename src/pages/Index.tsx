import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 p-8 rounded-lg bg-white shadow-xl max-w-md w-full mx-4"
      >
        <h1 className="text-4xl font-bold text-gray-800">Personality Quiz</h1>
        <p className="text-gray-600">Discover more about yourself through our personality assessment</p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/signup")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Sign Up
          </Button>
          <Button 
            onClick={() => navigate("/signin")}
            variant="outline"
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;