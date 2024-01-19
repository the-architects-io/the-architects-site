"use client";

import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { GET_INVITE_CODE } from "@/graphql/queries/get-invite-code";
import { useLazyQuery } from "@apollo/client";
import { useAuthenticationStatus, useSignUpEmailPassword } from "@nhost/nextjs";
import classNames from "classnames";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [isValidInviteCode, setIsValidInviteCode] = useState<boolean>(false);
  const [isValidatingInviteCode, setIsValidatingInviteCode] =
    useState<boolean>(false);

  const [handleValidateInviteCode, { loading }] = useLazyQuery(
    GET_INVITE_CODE,
    {
      fetchPolicy: "network-only",
      onCompleted: ({ inviteCodes }) => {
        if (inviteCodes.length > 0) {
          setIsValidInviteCode(true);
        } else {
          setIsValidInviteCode(false);
        }
      },
    }
  );

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

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      inviteCode: "",
    },
    onSubmit: async ({ email, password }) => {
      let res;

      try {
        res = await signUpEmailPassword(email, password, {
          allowedRoles: ["user"],
        });
      } catch (err) {
        console.log(err);
      }

      formik.setValues({ email: "", password: "", inviteCode: "" });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }

    if (signUpIsSuccess) {
      showToast({
        primaryMessage: "Sign up successful",
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
    signUpError?.message,
    signUpIsError,
    signUpIsSuccess,
  ]);

  const validateInviteCode = async (code: string) => {
    try {
      await handleValidateInviteCode({
        variables: {
          code,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsValidatingInviteCode(false);
    }
  };

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInviteCodeInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsValidatingInviteCode(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Your custom logic here
    console.log("Field changed:", event.target.value);

    // Debounced check if the invite code is valid
    debounceTimeoutRef.current = setTimeout(() => {
      validateInviteCode(event.target.value);
    }, 500);

    // Then call Formik's handleChange
    formik.handleChange(event);
  };

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
        <h1 className="text-3xl font-bold mb-4">Sign up</h1>
        <FormWrapper onSubmit={formik.handleSubmit}>
          <FormInputWithLabel
            label="Invite code"
            name="inviteCode"
            value={formik.values.inviteCode}
            onChange={handleInviteCodeInputChange}
            inputClassName={classNames([
              "border-2",
              isValidatingInviteCode ? "border-gray-600" : "border-sky-300",
              !isValidatingInviteCode &&
                !isValidInviteCode &&
                formik.values.inviteCode.length > 0 &&
                "border-red-500",
            ])}
          />
          {isValidInviteCode && (
            <>
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
                  isSubmitting={formik.isSubmitting || signUpIsLoading}
                  onClick={formik.handleSubmit}
                >
                  Submit
                </SubmitButton>
              </div>
              <div className="w-full flex justify-center">
                <Link
                  href="/login"
                  className="underline cursor-pointer text-center"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </FormWrapper>
      </Panel>
    </ContentWrapper>
  );
}
