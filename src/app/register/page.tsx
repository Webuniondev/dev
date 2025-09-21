"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AccountTypeSelector } from "@/components/account-type-selector";
import { ProRegistrationMultiStep } from "@/components/pro-registration-multi-step";
import { RegistrationSuccess } from "@/components/registration-success";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { UserRegistrationMultiStep } from "@/components/user-registration-multi-step";

type RegistrationStep = "select-type" | "user-form" | "pro-form" | "success";

export default function RegisterPage() {
  const [step, setStep] = useState<RegistrationStep>("select-type");
  const [accountType, setAccountType] = useState<"user" | "pro" | null>(null);

  const handleTypeSelect = (type: "user" | "pro") => {
    setAccountType(type);
    setStep(type === "user" ? "user-form" : "pro-form");
  };

  const handleBack = () => {
    setStep("select-type");
    setAccountType(null);
  };

  const handleSuccess = () => {
    setStep("success");
  };

  const renderStep = () => {
    switch (step) {
      case "select-type":
        return <AccountTypeSelector onSelect={handleTypeSelect} />;
      case "user-form":
        return <UserRegistrationMultiStep onBack={handleBack} onSuccess={handleSuccess} />;
      case "pro-form":
        return <ProRegistrationMultiStep onBack={handleBack} onSuccess={handleSuccess} />;
      case "success":
        return <RegistrationSuccess accountType={accountType!} />;
      default:
        return <AccountTypeSelector onSelect={handleTypeSelect} />;
    }
  };

  return (
    <main className="min-h-dvh relative overflow-hidden flex items-center">
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute -inset-[20%] bg-[radial-gradient(80rem_40rem_at_50%_10%,rgba(255,255,255,0.08),transparent_60%)]" />
        <BackgroundBeams />
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md lg:max-w-xl xl:max-w-2xl rounded-2xl bg-white/5 p-6 sm:p-8 backdrop-blur-md">
          {step !== "success" && (
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white text-sm hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="size-4" />
                Retour à l&apos;accueil
              </Link>
            </div>
          )}

          {step === "select-type" && (
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black font-bold">
                O
              </div>
              <p className="text-white/80 text-sm">Ourspace</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-caveat font-bold text-white">
                <span className="inline-block">
                  Rejoignez-nous
                  <span aria-hidden className="block mx-auto mt-2 w-1/2">
                    <svg className="w-full h-[4px]" viewBox="0 0 100 4" preserveAspectRatio="none">
                      <path
                        d="M0 2 Q 25 0 50 2 T 100 2"
                        stroke="white"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </h1>
            </div>
          )}

          {renderStep()}

          {step !== "success" && (
            <div className="mt-6 text-center text-white/80 text-sm">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold hover:text-white transition-colors">
                connectez-vous
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
