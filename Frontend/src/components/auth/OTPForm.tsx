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
//   otp: z.string().length(6, "OTP must be 6 digits"),
// });

// export function OTPForm() {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = async (data) => {
//     try {
//       const response = await fetch("/api/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       const result = await response.json();
//       if (response.ok) {
//         toast({ title: result.message });
//         navigate("/login");
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
//         <Label htmlFor="otp">OTP</Label>
//         <Input id="otp" {...register("otp")} />
//         {errors.otp && <p className="text-red-500">{errors.otp.message}</p>}
//       </div>
//       <Button type="submit">Verify OTP</Button>
//     </form>
//   );
// }