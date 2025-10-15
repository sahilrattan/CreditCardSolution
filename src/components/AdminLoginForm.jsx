"use client";

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trans } from "@lingui/react";
import AsyncForm from "../../form/AsyncForm";
import TextInputField from "../../form/formInputs/TextInputFiled";
import PasswordInput from "@/modules/form/formInputs/PasswordField";
import { Button } from "@/components/ui/button";
import SignInValidationSchema from "./validationSchema";
import { i18n } from "@lingui/core";
// import Cookies from "js-cookie";
import { AppServerService } from "@/api/services/AppServerService";
import type { LoginRequest } from "@/api/models/LoginRequest";
import type { AccessTokenResponse } from "@/api/models/AccessTokenResponse";
// import { CitiesService } from "@/api/services/CitiesService";
import { OpenAPI } from "@/api/core/OpenAPI";
import { storeTokens } from "@/utils/authToken";
// import { DepartmentService } from "@/api/services/DepartmentService";
import { CustomOpenAPIConfig } from "@/api/custom/OpenAPIConfig";
import { SopService } from "@/api/services/SopService";

const SignInForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (values) => {
      setIsLoading(true);
      
      const requestBody: LoginRequest = {
        email: values.email,
        password: values.password,
        twoFactorCode: "",
        twoFactorRecoveryCode: "",
      };

      AppServerService.postApiVIdentityLogin(false, false, requestBody)
        .then((response: AccessTokenResponse) => {
          const { accessToken, refreshToken } = response;

          storeTokens(accessToken ?? "", refreshToken ?? "");

          OpenAPI.TOKEN = CustomOpenAPIConfig.TOKEN;

          return SopService.getApiVSop("1");
        })
        .then((sopData) => {
          setIsLoading(false);
          navigate("/sop-list", {
            state: { sop: sopData },
          });
        })
        .catch((error) => {
          setIsLoading(false);
          console.error("Login error:", error);
          alert("Login failed: " + (error?.message || "Unknown error"));
        });
    },
    [navigate]
  );

  const handleToggleToSignUp = () => {
    navigate("/signup");
  };

  const handleChangePassword = () => {
    navigate("/forgot-password");
  };

  return (
    <AsyncForm
      name="SignInForm"
      onSubmit={handleSubmit}
      ValidationSchema={SignInValidationSchema}
    >
      {(formProps) => (
        <div className="w-full max-w-md mx-auto mt-10 px-6 py-8 rounded-xl dark:bg-zinc-900 space-y-6 bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-primary">
              {i18n.t({ id: "ui.Sign In", message: "Sign In" })}
            </h2>
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground block"
            >
              {i18n.t({ id: "ui.Email", message: "Email" })}
            </label>
            <TextInputField
              id="email"
              name="email"
              placeholder="email@example.com"
              type="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground block"
            >
              {i18n.t({ id: "ui.Password", message: "Password" })}
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder={i18n.t({
                id: "ui.Enter Your Password",
                message: "Enter Your Password",
              })}
            />
          </div>

          <div>
            <button
              onClick={handleChangePassword}
              className="text-primary cursor-pointer justify-end underline"
              type="button"
            >
              {i18n.t({
                id: "ui.Forgot Your Password",
                message: "Forgot Your Password?",
              })}
            </button>
          </div>

          <div>
            <Button 
              type="submit" 
              className="cursor-pointer w-full"
              disabled={isLoading || formProps.submitting}
            >
              {isLoading || formProps.submitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <Trans id="Signing In..." />
                </div>
              ) : (
                i18n.t({ id: "ui.Sign In", message: "Sign In" })
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-foreground mt-4 space-y-2">
            <div>
              {i18n.t({
                id: "ui.Don't have an account?",
                message: "Don't have an account?",
              })}{" "}
              <button
                onClick={handleToggleToSignUp}
                className="text-primary underline cursor-pointer"
                type="button"
              >
                {i18n.t({ id: "ui.Sign up", message: "Sign up" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </AsyncForm>
  );
};

export default SignInForm;
