// "use client";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { signUp } from "../../../../lib/auth-client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Mail, Lock, Loader2 } from "lucide-react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// const schema = z.object({
//   email: z.email("Invalid email address"),
//   password: z.string().min(8, "Password must be at least 6 characters"),
// });

// type FormData = z.infer<typeof schema>;

// export default function Register() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const form = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (data: FormData) => {
//     setLoading(true);
//     try {
//       await signUp.email({
//         email: data.email,
//         password: data.password,
//         name: data.email.split("@")[0],
//       });
//       router.push("/me");
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//       <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             Create an Account
//           </h1>
//           <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//             Register to have more fun
//           </p>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-gray-700 dark:text-gray-300">
//                     Email Address
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative flex items-center">
//                       <Mail className="absolute left-3  transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="email"
//                         placeholder="Enter your email"
//                         className="pl-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage className="text-red-500 text-sm" />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-gray-700 dark:text-gray-300">
//                     Password
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative flex items-center">
//                       <Lock className="absolute left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <Input
//                         type="password"
//                         placeholder="Enter your password"
//                         className="pl-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage className="text-red-500 text-sm" />
//                 </FormItem>
//               )}
//             />

//             <Button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200 flex items-center justify-center"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                   Registering...
//                 </>
//               ) : (
//                 "Register"
//               )}
//             </Button>
//           </form>
//         </Form>

//         <p className="text-center text-sm text-gray-600 dark:text-gray-400">
//           Already have an account?{" "}
//           <Link
//             href="/auth/sign-in"
//             className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "../../../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Function to check if username exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(data.name);

      if (usernameExists) {
        form.setError("name", {
          type: "manual",
          message: "Username is already taken",
        });
        setLoading(false);
        return;
      }

      // Proceed with registration
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      // Check if there was an error in the result
      if (result.error) {
        const errorMessage = result.error.message || "Registration failed";

        // Check for specific error types
        if (
          errorMessage.toLowerCase().includes("username") ||
          errorMessage.toLowerCase().includes("name") ||
          errorMessage.toLowerCase().includes("unique")
        ) {
          form.setError("name", {
            type: "manual",
            message: "Username is already taken",
          });
        } else if (errorMessage.toLowerCase().includes("email")) {
          form.setError("email", {
            type: "manual",
            message: "Email is already registered",
          });
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      // Only redirect if successful
      router.push("/me");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle different error types
      const errorMessage = error?.message || error?.toString() || "";
      console.log(errorMessage);

      if (
        errorMessage.toLowerCase().includes("username") ||
        errorMessage.toLowerCase().includes("name") ||
        errorMessage.toLowerCase().includes("unique constraint")
      ) {
        form.setError("name", {
          type: "manual",
          message: "Username is already taken",
        });
      } else if (errorMessage.toLowerCase().includes("email")) {
        form.setError("email", {
          type: "manual",
          message: "Email is already registered",
        });
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Register to have more fun
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <User className="absolute left-3  transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        className="pl-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3  transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3  transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
