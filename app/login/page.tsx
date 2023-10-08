"use client";
import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import {
  useAuthenticationStatus,
  useSignInEmailPassword,
  useSignUpEmailPassword,
} from "@nhost/nextjs";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const { isAuthenticated, isLoading: isLoadingAuth } =
    useAuthenticationStatus();

  const {
    signUpEmailPassword,
    needsEmailVerification: signUpNeedsEmailVerification,
    isLoading: signUpIsLoading,
    isSuccess: signUpIsSuccess,
    isError: signUpIsError,
    error: signUpError,
  } = useSignUpEmailPassword();

  const {
    signInEmailPassword,
    needsEmailVerification: signInNeedsEmailVerification,
    isLoading: signInIsLoading,
    isSuccess: signInIsSuccess,
    isError: signInIsError,
    error: signInError,
  } = useSignInEmailPassword();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ email, password }) => {
      let res;

      switch (mode) {
        case "login":
          res = await signInEmailPassword(email, password);
          break;
        case "signup":
          res = await signUpEmailPassword(email, password, {
            allowedRoles: ["user"],
          });
          break;
      }

      formik.setValues({ email: "", password: "" });
      console.log(res);
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }

    if (signUpIsSuccess && !signInIsSuccess) {
      showToast({
        primaryMessage: "Sign up successful",
      });
    }

    if (signInIsError) {
      showToast({
        primaryMessage: "Login failed",
        secondaryMessage: signInError?.message,
      });
    }

    if (signUpIsError) {
      showToast({
        primaryMessage: "Sign up failed",
        secondaryMessage: signUpError?.message,
      });
    }
  }, [
    isAuthenticated,
    router,
    signInError?.message,
    signInIsError,
    signUpError?.message,
    signUpIsError,
    signUpIsSuccess,
    signInIsSuccess,
  ]);

  if (isLoadingAuth || isAuthenticated) {
    return (
      <ContentWrapper className="w-full flex justify-center">
        <Spinner />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-8 w-full">
        <h1 className="text-3xl font-bold mb-4">
          {mode === "login" ? "Login" : "Sign up"}
        </h1>
        <FormWrapper onSubmit={formik.handleSubmit}>
          <FormInputWithLabel
            label="Email address"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <FormInputWithLabel
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          <div className="w-full flex justify-center">
            <SubmitButton
              isSubmitting={
                formik.isSubmitting || signUpIsLoading || signInIsLoading
              }
              onClick={formik.handleSubmit}
            >
              Submit
            </SubmitButton>
          </div>
          <div className="w-full flex justify-center">
            <div
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="underline cursor-pointer text-center"
            >
              {mode === "login" ? "Sign up" : "Login"}
            </div>
          </div>
        </FormWrapper>
      </Panel>
    </ContentWrapper>
  );
}
