type TCardAuthenticationOption = {
  handleLogin: () => void;
  handleRegister: () => void;
  isLoggedIn: boolean;
  isRegistered: boolean;
  status: string;
};

const CardAuthenticationOption: React.FC<TCardAuthenticationOption> = ({
  handleLogin,
  handleRegister,
  isLoggedIn,
  isRegistered,
  status,
}) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ fontWeight: "bold", marginBottom: "30px" }}>
        Step 1: Login or Register with Biometric
      </h2>

       <p
          style={{
            padding: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "5px",
            minHeight: "20px",
            marginBottom: "20px",
          }}
        >
          {status || "Ready to start..."}
        </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={handleLogin}
          disabled={isLoggedIn}
          className="register-btn"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4.268 18.845c.225 1.67 1.608 2.979 3.292 3.056c1.416.065 2.855.099 4.44.099s3.024-.034 4.44-.1c1.684-.076 3.067-1.385 3.292-3.055c.147-1.09.268-2.207.268-3.345s-.121-2.255-.268-3.345c-.225-1.67-1.608-2.979-3.292-3.056A95 95 0 0 0 12 9c-1.585 0-3.024.034-4.44.1c-1.684.076-3.067 1.385-3.292 3.055C4.12 13.245 4 14.362 4 15.5s.121 2.255.268 3.345Z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 9V6.5a4.5 4.5 0 0 1 9 0V9"
                />
                <path strokeLinecap="round" d="M8 17.5V16a4 4 0 0 1 8 0v1.5" />
                <path
                  strokeLinecap="round"
                  d="M10.5 19v-3a1.5 1.5 0 0 1 3 0m0 3v-1"
                />
              </g>
            </svg>
          </div>
          {isLoggedIn ? "✓ Logged In" : "Login with Biometric"}
        </button>
        <button
          onClick={handleRegister}
          disabled={isRegistered}
          className="register-btn"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M15 4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m0 1.9a2.1 2.1 0 1 1 0 4.2A2.1 2.1 0 0 1 12.9 8A2.1 2.1 0 0 1 15 5.9M4 7v3H1v2h3v3h2v-3h3v-2H6V7zm11 6c-2.67 0-8 1.33-8 4v3h16v-3c0-2.67-5.33-4-8-4m0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H8.9V17c0-.64 3.1-2.1 6.1-2.1"
              />
            </svg>
          </div>
          {isRegistered ? "✓ Registered" : "Register Biometric"}
        </button>
      </div>
      <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>
        {!isLoggedIn
          ? "Login to authenticate with existing credentials, or register if this is your first time."
          : "You are authenticated and ready to encrypt/decrypt data."}
      </p>
    </div>
  );
};

export default CardAuthenticationOption;