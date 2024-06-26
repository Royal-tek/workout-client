"use client";
import {
  checkUser,
  loginUser,
  socialAuthentication,
  userProfile,
} from "@/api/user";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/libs/utils";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
} from "@/utils/localstorage";
import useProfile from "@/hooks/useProfile";
import Image from "next/image";

const LoginForm = () => {
  const queryClient = useQueryClient();
  const [isSignIn, setIsSignIn] = useState(false);
  const router = useRouter();
  const { profile, refetch } = useProfile();
  const [showPassword, setShowPassword] = useState(false);
  const { data } = useSession();
  const { mutateAsync: socialAuth, isLoading: authLoading } = useMutation({
    mutationFn: socialAuthentication,
  });
  const { mutate: checkUserExist, isLoading: checkingForUser } = useMutation({
    mutationFn: checkUser,
    onSuccess: (response) => {
      if (data) {
        loginWithSocailAuth();
      }
    },
  });

  useEffect(() => {
    if (isSignIn) {
      const refetchProfile = () => {
        setTimeout(() => {
          refetch();
        }, 2000);
      };

      refetchProfile();
    }
  }, [isSignIn, router]);

  useEffect(() => {
    if (profile && profile.steps === "done") {
      router.replace("/");
    } else if (profile && profile.steps !== "done") {
      router.push("/configure-profile");
    } else if (data?.user) {
      checkUserExist({ value: { email: data?.user?.email } });
    }
  }, [profile, router, data, checkUserExist]);

  const loginWithSocailAuth = async () => {
    await socialAuth({
      name: data!.user!.name as string,
      username: `${(data!.user!.name as string).split(" ")?.[0]}${Math.floor(
        1000 * Math.random() * 9000
      ).toString()}`,
      email: data!.user!.email as string,
    })
      .then(async (data) => {
        setTokenToLocalStorage(data?.token);
        setIsSignIn(true);
        await queryClient.prefetchQuery("profile", userProfile);
        // router.push("/onboarding");
      })
      .catch(() => {
        setIsSignIn(false);
      })
      .finally(() => getTokenFromLocalStorage());
  };

  const validator = yup.object().shape({
    email: yup
      .string()
      .email("Please provide a valid email address")
      .required("Please fill your email"),
    password: yup.string().required("Please fill your password"),
  });

  type signupTypeReference = yup.InferType<typeof validator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signupTypeReference>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(validator),
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: loginUser,
    onError: (value: any) => {
      toast.error(value?.message);
    },
    onSuccess: (value: any) => {
      setTokenToLocalStorage(value?.token);
      setIsSignIn(true);
    },
  });

  const handleSignup = (values: signupTypeReference) => {
    mutate({ value: values });
  };
  return (
    <>
      {checkingForUser || authLoading ? (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-20">
          <div className=" bg-zinc-800/50 rounded-xl px-5 py-7 flex items-center justify-center flex-col gap-3">
            <div>
              <Loader2 className=" animate-spin" size={24} />
            </div>
          </div>
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit(handleSignup)}
        className="flex flex-col gap-2 relative w-full"
      >
        <div className=" flex flex-col items-center justify-center py-3 group">
          <Image
            src={"/assets/logo3.svg"}
            alt="logo"
            priority
            height={100}
            width={100}
          />

          <p className=" text-lg font-bold group-hover:tracking-[.25rem] transition-all ease-in-out duration-200 tracking-[.2rem] -mt-2">
            Ma<span className=" text-[28px]">x</span>up
          </p>
        </div>

        <p className=" sm:text-2xl font-bold md:mb-5 mb-3 w-full ">Log In</p>

        <div
          onClick={() => signIn("google")}
          className=" flex items-center justify-center  bg-neutral-200 hover:bg-white cursor-pointer text-black rounded-full py-3 sm:min-w-[350px] w-full text-lg font-medium gap-2 "
        >
          <FcGoogle className="text-xl" />
          Login with Google
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full flex items-center justify-center gap-4 text-zinc-400">
            <div className="h-[2px] w-full bg-zinc-800" /> or{" "}
            <div className="h-[2px] w-full bg-zinc-800" />
          </div>
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="name" className=" text-lg">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="your-email@gmail.com"
              className={cn(
                "bg-transparent focus:outline-none border-[2px] p-3 border-zinc-400  focus:border-white rounded-lg h-[50px]",
                {
                  "border-red-500 focus:border-red-500": errors.email,
                }
              )}
            />
            {errors.email && (
              <p className=" text-primary -mt-2">{errors.email.message}</p>
            )}
          </div>
          <div className="w-full flex flex-col gap-3 ">
            <label htmlFor="password" className=" text-lg">
              Password
            </label>
            <div className="relative w-full">
              <input
                {...register("password", { required: true })}
                placeholder="--------"
                type={showPassword ? "text" : "password"}
                className={cn(
                  "bg-transparent w-full focus:outline-none border-[2px] p-3 border-zinc-400  focus:border-white rounded-lg h-[50px]",
                  {
                    "border-red-500 focus:border-red-500": errors.password,
                  }
                )}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </div>
              {errors.password && (
                <p className=" text-primary">{errors.password?.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className=" flex items-center justify-center px-8 bg-neutral-200 hover:bg-white cursor-pointer text-black  rounded-full py-3 sm:min-w-[350px] w-full text-lg font-medium gap-2 "
          >
            {!isLoading ? (
              "Login"
            ) : (
              <>
                Loading.. <Loader2 className=" animate-spin" color="black" />
              </>
            )}
          </button>
          <p className=" text-center">
            I don&apos;t have an account?{" "}
            <Link href={"/signup"} className=" text-blue-500 font-medium ">
              {" "}
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
