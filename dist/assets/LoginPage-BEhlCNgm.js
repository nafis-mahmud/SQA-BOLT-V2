import{r as o,u as N,j as e,C as v,a as S,b,d as I,e as E,f as x,I as h,L as p,B as C,g as L,s as g,h as D,i as k}from"./index-BLwlHcKQ.js";function F(){const[r,f]=o.useState("demo@example.com"),[n,j]=o.useState("password123"),[d,l]=o.useState(!1),[c,i]=o.useState(null),m=N(),w=async a=>{a.preventDefault(),i(null),l(!0);try{if(r==="demo@example.com"&&n==="password123"){setTimeout(()=>{try{localStorage.setItem("isLoggedIn","true"),localStorage.setItem("userEmail",r);const t=y(r);g(t),m("/dashboard")}catch(t){console.error("Error in demo login:",t),i("Error during login process"),l(!1)}},1e3);return}const{data:s,error:u}=await D.auth.signInWithPassword({email:r,password:n});if(u)throw u;if(s&&s.user){localStorage.setItem("isLoggedIn","true"),localStorage.setItem("userEmail",r),localStorage.setItem("userId",s.user.id);const t=await k();t&&g(t),m("/dashboard")}}catch(s){console.error("Login error:",s),i(s.message||"Failed to sign in")}finally{l(!1)}},y=a=>{const s={userId:"demo-user-id",email:a,role:"user",iat:Math.floor(Date.now()/1e3),exp:Math.floor(Date.now()/1e3)+3600};return btoa(JSON.stringify(s))};return e.jsx("div",{className:"flex min-h-screen items-center justify-center bg-slate-50 p-4",children:e.jsxs(v,{className:"w-full max-w-md",children:[e.jsxs(S,{className:"space-y-1",children:[e.jsx(b,{className:"text-2xl font-bold",children:"Sign in"}),e.jsx(I,{children:"Enter your email and password to access your account"})]}),e.jsx(E,{children:e.jsxs("form",{onSubmit:w,className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(x,{htmlFor:"email",children:"Email"}),e.jsx(h,{id:"email",type:"email",placeholder:"name@example.com",value:r,onChange:a=>f(a.target.value),required:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(x,{htmlFor:"password",children:"Password"}),e.jsx(p,{to:"/forgot-password",className:"text-sm text-primary hover:underline",children:"Forgot password?"})]}),e.jsx(h,{id:"password",type:"password",value:n,onChange:a=>j(a.target.value),required:!0})]}),c&&e.jsx("p",{className:"text-sm text-red-500",children:c}),e.jsx(C,{type:"submit",className:"w-full",disabled:d,children:d?"Signing in...":"Sign in"}),e.jsxs("div",{className:"mt-2 text-center text-xs text-muted-foreground",children:[e.jsx("p",{children:"Demo credentials are pre-filled for you"}),e.jsx("p",{children:"Email: demo@example.com / Password: password123"})]})]})}),e.jsx(L,{className:"flex justify-center",children:e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Don't have an account?"," ",e.jsx(p,{to:"/signup",className:"text-primary hover:underline",children:"Sign up"})]})})]})})}export{F as default};
