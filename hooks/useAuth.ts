const useAuth = () => {
  const signin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        console.log("Token:", token);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const signup = async () => {
    // Implement signup logic
  };

  return { signin, signup };
};

export default useAuth;
