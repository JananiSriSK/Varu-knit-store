import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home with login modal open
    navigate('/?login=true');
  }, [navigate]);

  return null;
};

export default Login;
