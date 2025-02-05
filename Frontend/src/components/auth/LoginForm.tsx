// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { useNavigate } from "react-router-dom";

// const schema = z.object({
//   email: z.string().email("Invalid email"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// export function LoginForm() {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = async (data) => {
//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       const result = await response.json();
//       if (response.ok) {
//         localStorage.setItem("token", result.token);
//         toast({ title: "Login successful!" });
//         navigate("/");
//       } else {
//         toast({ title: "Error", description: result.message, variant: "destructive" });
//       }
//     } catch (error) {
//       toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div>
//         <Label htmlFor="email">Email</Label>
//         <Input id="email" type="email" {...register("email")} />
//         {errors.email && <p className="text-red-500">{errors.email.message}</p>}
//       </div>
//       <div>
//         <Label htmlFor="password">Password</Label>
//         <Input id="password" type="password" {...register("password")} />
//         {errors.password && <p className="text-red-500">{errors.password.message}</p>}
//       </div>
//       <Button type="submit">Login</Button>
//     </form>
//   );
// }