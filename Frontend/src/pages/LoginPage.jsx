import LoginForm from "@/components/ui/auth/login-form";
import loginPic from "@/assets/login.png";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background md:flex-row bg-muted/10">
      {/* Left: form (40%) */}
      <div className="w-full flex items-center justify-center px-8 py-12">
        <div className="w-full p-8">
          <h1 className="text-4xl font-bold text-primary mb-8">SalesCRM</h1>
          <LoginForm />
        </div>
      </div>

      {/* Right: illustration (hidden on small) — 60% */}
      <div className="hidden md:flex items-center justify-center h-screen overflow-hidden">
        <div className="min-w-xl w-full overflow-hidden">
          {/* Decorative illustration (clipped to container height) */}
          <img
            src={loginPic}
            alt="Login Illustration"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
