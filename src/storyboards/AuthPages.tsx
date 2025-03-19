import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import ForgotPasswordPage from "@/components/auth/ForgotPasswordPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPages() {
  return (
    <div className="w-full p-4">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginPage />
        </TabsContent>
        <TabsContent value="signup">
          <SignupPage />
        </TabsContent>
        <TabsContent value="forgot">
          <ForgotPasswordPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
