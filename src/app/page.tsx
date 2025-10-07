"use client";
import { useEffect, useState } from "react";
import { client } from "@passwordless-id/webauthn";
import CardAuthenticationOption from "@/components/CardAuthenticationOption";
import CardCalculate from "@/components/CardCalculate";
import CardPayrollClosed from "@/components/CardPayrollClosed";
import { useRouter, useSearchParams } from "next/navigation";
import CardFinalResult from "@/components/CardFinalResult";

export type PayrollState = "auth" | "calculate" | "closed" | "result";

interface PayrollStateComponent {
  component: React.FC<any>;
  props?: Record<string, any>;
}

export default function Home() {
  const [salary, setSalary] = useState<number>(100000);
  const [chiptext, setChiptext] = useState<ArrayBuffer>(new ArrayBuffer(0));
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [decryptedSalary, setDecryptedSalary] = useState<string>("");
  const challenge = "userID";

  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<PayrollState>("auth");

  // Store the encrypted session key and IVs
  const [encryptedSessionKey, setEncryptedSessionKey] = useState<ArrayBuffer>(
    new ArrayBuffer(0)
  );
  const [iv, setIv] = useState<Uint8Array>(new Uint8Array(0));
  const [sessionKeyIv, setSessionKeyIv] = useState<Uint8Array>(
    new Uint8Array(0)
  );

  const handleRegister = async () => {
    try {
      setStatus("Starting biometric registration...");

      // Register a new WebAuthn credential
      const registration = await client.register({
        user: "userID",
        challenge: "registration-challenge",
      });

      setStatus("Biometric registration successful!");
      setIsRegistered(true);
      setIsLoggedIn(true);
      console.log("Registration successful:", registration);
    } catch (error) {
      setStatus(`Registration failed: ${error}`);
      console.error("Registration error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      setStatus("Attempting biometric login...");

      // First, try to authenticate with existing credentials
      try {
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: new TextEncoder().encode(challenge),
            allowCredentials: [],
            userVerification: "required",
            timeout: 60000,
          },
        });

        if (assertion) {
          setStatus("Login successful! You are now authenticated.");
          setIsLoggedIn(true);
          setIsRegistered(true);
          console.log("Login successful:", assertion);
          return;
        }
      } catch (authError) {
        // If authentication fails, check if user needs to register
        setStatus("No existing credentials found. Please register first.");
        console.log(
          "Authentication failed, user needs to register:",
          authError
        );

        // Show option to register
        const shouldRegister = confirm(
          "No biometric credentials found. Would you like to register now?"
        );
        if (shouldRegister) {
          await handleRegister();
        } else {
          setStatus("Login cancelled. Please register to continue.");
        }
      }
    } catch (error) {
      setStatus(`Login failed: ${error}`);
      console.error("Login error:", error);
    }
  };

  const handleEncrypt = async () => {
    try {
      if (!isLoggedIn) {
        setStatus("Please login first!");
        return;
      }

      setStatus("Authenticating with biometric to encrypt...");

      // First authenticate with biometric to get the private key
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (!assertion) {
        setStatus("Biometric authentication failed!");
        return;
      }

      setStatus("Biometric authentication successful! Encrypting...");

      // Generate a random AES session key
      const sessionKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // Generate random IV
      const randomIv = crypto.getRandomValues(new Uint8Array(12));
      setIv(randomIv);

      // Encrypt the salary using AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: randomIv },
        sessionKey,
        new TextEncoder().encode(salary.toString())
      );

      // Encrypt the session key with the WebAuthn public key
      // For this demo, we'll use a simple approach where we derive a key from the assertion
      const publicKeyAssertion = assertion as PublicKeyCredential;
      const authenticatorAssertionResponse =
        publicKeyAssertion.response as AuthenticatorAssertionResponse;
      const assertionBuffer = new Uint8Array(
        authenticatorAssertionResponse.authenticatorData
      );
      const derivedKey = await crypto.subtle.importKey(
        "raw",
        assertionBuffer.slice(0, 32), // Use first 32 bytes as key material
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      // Encrypt the session key with the derived key
      const sessionKeyData = await crypto.subtle.exportKey("raw", sessionKey);
      const sessionKeyIvValue = crypto.getRandomValues(new Uint8Array(12));
      setSessionKeyIv(sessionKeyIvValue);
      const encryptedSessionKeyData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: sessionKeyIvValue },
        derivedKey,
        sessionKeyData
      );

      setEncryptedSessionKey(encryptedSessionKeyData);
      setChiptext(encrypted);
      setStatus("Salary encrypted successfully with biometric protection!");
      console.log("Encrypted salary:", encrypted);
    } catch (error) {
      setStatus(`Encryption failed: ${error}`);
      console.error("Encryption error:", error);
    }
  };

  const handleDecrypt = async () => {
    try {
      if (!isLoggedIn) {
        setStatus("Please login first!");
        return;
      }

      if (chiptext.byteLength === 0) {
        setStatus("No encrypted data to decrypt!");
        return;
      }

      setStatus("Authenticating with biometric...");

      // Get biometric authentication
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (!assertion) {
        setStatus("Biometric authentication failed!");
        return;
      }

      setStatus(
        "Biometric authentication successful! Decrypting session key..."
      );

      // Derive the same key used for encryption
      const publicKeyAssertion = assertion as PublicKeyCredential;
      const authenticatorAssertionResponse =
        publicKeyAssertion.response as AuthenticatorAssertionResponse;
      const assertionBuffer = new Uint8Array(
        authenticatorAssertionResponse.authenticatorData
      );
      const derivedKey = await crypto.subtle.importKey(
        "raw",
        assertionBuffer.slice(0, 32), // Use first 32 bytes as key material
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      // Decrypt the session key using the derived key
      const sessionKeyData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(sessionKeyIv) },
        derivedKey,
        encryptedSessionKey
      );

      // Import the decrypted session key
      const sessionKey = await crypto.subtle.importKey(
        "raw",
        sessionKeyData,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      setStatus("Session key decrypted! Decrypting salary...");

      // Decrypt the salary
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        sessionKey,
        chiptext
      );

      const salaryText = new TextDecoder().decode(decrypted);
      setDecryptedSalary(salaryText);
      setStatus(`Decryption successful! Salary: ${salaryText}`);
      console.log("Decrypted salary:", salaryText);
    } catch (error) {
      setStatus(`Decryption failed: ${error}`);
      console.error("Decryption error:", error);
    }
  };

  const handleDecryptWithoutSessionKey = async () => {
    const fakeSessionKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      fakeSessionKey,
      chiptext
    );

    setDecryptedSalary(new TextDecoder().decode(decrypted));
  };

  const payrollStateComponents: Record<PayrollState, PayrollStateComponent> = {
    auth: {
      component: CardAuthenticationOption,
      props: {
        status: status,
        isLoggedIn: isLoggedIn,
        handleLogin: handleLogin,
        handleRegister: handleRegister,
        isRegistered: isRegistered,
      },
    },
    calculate: {
      component: CardCalculate,
      props: {
        status: status,
        handleEncrypt: handleEncrypt,
        setSalary: setSalary,
        salary: salary,
        isLoggedIn: isLoggedIn,
      },
    },
    closed: {
      component: CardPayrollClosed,
      props: {
        status: status,
        handleDecrypt: handleDecrypt,
        handleRegister: handleRegister,
        isLoggedIn: isLoggedIn,
        chiptext: chiptext,
        handleDecryptWithoutSessionKey: handleDecryptWithoutSessionKey,
      },
    },
    result: {
      component: CardFinalResult,
      props: {
        handleDecrypt: handleDecrypt,
        isLoggedIn: isLoggedIn,
        status: status,
        salary: salary,
        chiptext: chiptext,
        decryptedSalary: decryptedSalary,
      },
    },
  };

  useEffect(() => {
    const currentStep = searchParams.get("step") as PayrollState | null;
    if (currentStep) {
      setStep(currentStep);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", "auth");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    let nextStep: PayrollState | null = null;

    if (!isLoggedIn) {
      nextStep = "auth";
    } else if (isLoggedIn && isRegistered) {
      if (step === "auth") {
        nextStep = "calculate";
      } else if (step === "calculate" && chiptext.byteLength > 0) {
        nextStep = "closed";
      } else if (step === "closed" && decryptedSalary) {
        nextStep = "result";
      }
    }

    if (nextStep && nextStep !== step) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", nextStep);
      router.replace(`?${params.toString()}`);
      setStep(nextStep);
    }
  }, [isLoggedIn, isRegistered, chiptext, step, searchParams, router, status]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <h2
        style={{
          position: "absolute",
          top: "150px",
          fontSize: "30px",
          fontWeight: "bold",
          color: "#283A97",
        }}
      >
        Payroll Processing Demo (Example Steps)
      </h2>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.5s ease",
          }}
        >
          {Object.entries(payrollStateComponents).map(
            ([key, { component: Component, props }]) => (
              <div
                key={key}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.5s ease-in-out",
                  opacity: step === key ? 1 : 0,
                  transform: step === key ? "scale(1)" : "scale(0.95)",
                  pointerEvents: step === key ? "auto" : "none",
                  zIndex: step === key ? 10 : 0,
                }}
              >
                <Component {...props} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}